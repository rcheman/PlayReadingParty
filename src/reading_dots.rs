use crate::AppState;
use actix_web::{get, post, web, HttpResponse, Responder};
use actix_web_lab::__reexports::futures_util::future;
use actix_web_lab::__reexports::tokio;
use actix_web_lab::sse::{self, ChannelStream, Sse};
use serde::{Deserialize, Serialize};
use sqlx::PgPool;
use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::Mutex;

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct UpdateForm {
    actor_id: i32,
    script_id: i32,
    position: f64,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
struct BroadcastMessage {
    actor_id: i32,
    position: f64,
}

// clients is map of scriptId to vector of subscribers of that id
pub struct Broadcaster {
    clients: Mutex<HashMap<String, Vec<sse::Sender>>>,
}

impl Broadcaster {
    pub fn new() -> Arc<Self> {
        Arc::new(Broadcaster {
            clients: Mutex::new(HashMap::new()),
        })
    }

    pub async fn new_client(
        &self,
        script_id: i32,
        current_messages: Vec<String>,
    ) -> Sse<ChannelStream> {
        let (tx, rx) = sse::channel(10);

        // Send existing positions to new client
        let send_futures = current_messages
            .into_iter()
            .map(|m| tx.send(sse::Data::new(m)));
        let _ = future::join_all(send_futures).await;

        // Save client for later broadcasts

        let mut clients = self.clients.lock().await;

        match clients.get_mut(&script_id.to_string()) {
            None => {
                clients.insert(script_id.to_string(), vec![tx]);
                println!("Clients: 1\t ----- Added first Client! ----- ");
            }
            Some(senders) => {
                senders.push(tx);
                println!("Clients: {}\t ----- Added new Client! ----- ", senders.len());
            }
        }


        rx
    }

    pub async fn send_message(&self, script_id: i32, message: String) {
        let mut clients = self.clients.lock().await;

        if let Some(senders) = clients.get_mut(&script_id.to_string()) {
            // Send message to all subscribers of this script
            let send_futures = senders
                .iter()
                .map(|s| s.send(sse::Data::new(message.clone())));
            let results = future::join_all(send_futures).await;

            // Remove subscribers we failed to send the message to, they have probably disconnected
            let mut result_iter = results.iter();
            senders.retain(|_| {
                let result = result_iter.next().unwrap();
                if result.is_err() {
                    println!("----- Removed Client! -----");
                }
                result.is_ok()
            });
        }
    }
}

async fn get_current_messages(db: &PgPool, script_id: i32) -> Vec<String> {
    let dots = sqlx::query!(
        "SELECT actor_id, position FROM read_position WHERE script_id = $1",
        script_id
    )
    .fetch_all(db)
    .await;

    if let Ok(dots) = dots {
        dots.iter()
            .map(|r| {
                serde_json::to_string(&BroadcastMessage {
                    actor_id: r.actor_id,
                    position: r.position,
                })
                .unwrap()
            })
            .collect()
    } else {
        Vec::new()
    }
}

#[post("/positions")]
pub async fn report_position(
    data: web::Data<AppState>,
    broadcaster: web::Data<Broadcaster>,
    position: web::Json<UpdateForm>,
) -> impl Responder {
    let position = position.into_inner();
    let position = UpdateForm {
        position: position.position.clamp(0.0, 1.0), // ensure position data is valid
        ..position
    };

    let message = serde_json::to_string(&BroadcastMessage {
        actor_id: position.actor_id,
        position: position.position,
    })
    .unwrap();

    // Send position to all subscriber clients
    broadcaster.send_message(position.script_id, message).await;

    // Save position to database
    let result = sqlx::query!(
        "INSERT INTO read_position (actor_id, script_id, position)
             VALUES ($1, $2, $3)
         ON CONFLICT ON CONSTRAINT read_position_uq
             DO UPDATE SET position = $3",
        position.actor_id,
        position.script_id,
        position.position
    )
    .execute(&data.db)
    .await;

    match result {
        Ok(_) => HttpResponse::Ok(),
        Err(_) => HttpResponse::InternalServerError(),
    }
}

#[get("/positions/{script_id}")]
pub async fn subscribe(
    data: web::Data<AppState>,
    broadcaster: web::Data<Broadcaster>,
    script_id: web::Path<i32>,
) -> impl Responder {
    let script_id = script_id.into_inner();

    let messages = get_current_messages(&data.db, script_id).await;

    broadcaster.new_client(script_id, messages).await
}
