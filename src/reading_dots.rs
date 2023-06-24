use crate::AppState;
use actix_web::{get, post, web, HttpResponse, Responder};
use actix_web_lab::__reexports::futures_util::future;
use actix_web_lab::sse::{self, ChannelStream, Sse};
use parking_lot::Mutex;
use serde::{Deserialize, Serialize};
use serde_json::json;
use std::collections::HashMap;
use std::sync::Arc;

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
    position: f64
}

// clients is map of scriptId to vector of subscribers of that id
pub struct Broadcaster {
    clients: Mutex<HashMap<String, Vec<sse::Sender>>>,
    dot_ids: Mutex<HashMap<i64, i32>>,
}

impl Broadcaster {
    pub fn new() -> Arc<Self> {
        Arc::new(Broadcaster {
            clients: Mutex::new(HashMap::new()),
            dot_ids: Mutex::new(HashMap::new()),
        })
    }

    pub async fn new_client(&self, script_id: i32, messages: Vec<String>) -> Sse<ChannelStream> {
        let (tx, rx) = sse::channel(10);

        // Send existing positions to new client
        let send_futures = messages.into_iter().map(|m| tx.send(sse::Data::new(m)));
        let _ = future::join_all(send_futures).await;

        // Save client for later broadcasts
        {
            let mut clients = self.clients.lock();

            match clients.get_mut(&script_id.to_string()) {
                None => {
                    clients.insert(script_id.to_string(), vec![tx]);
                }
                Some(senders) => {
                    senders.push(tx);
                }
            }
        }

        rx
    }
}

#[post("/positions")]
pub async fn report_position(
    data: web::Data<AppState>,
    broadcaster: web::Data<Broadcaster>,
    position: web::Json<UpdateForm>,
) -> impl Responder {
    // todo fetch dotId from cache
    // todo create subscriber storage with mutex?
    // todo report position to other subscribers

    let position = position.into_inner();
    let position = UpdateForm {
        position: position.position.clamp(0.0, 1.0), // ensure position data is valid
        ..position
    };

    let dot_key = position.actor_id as i64 + ((position.script_id as i64) << 32);

    let dot_id = sqlx::query!(
        "INSERT INTO read_position (actor_id, script_id, position)
                 VALUES ($1, $2, 0)
                 ON CONFLICT ON CONSTRAINT read_position_uq
                     DO UPDATE SET actor_id = $1 -- need to do some update to allow us to return id
                 RETURNING ID",
        position.actor_id,
        position.script_id
    )
    .fetch_one(&data.db)
    .await;

    let dot_id = match dot_id {
        Err(_) => return HttpResponse::InternalServerError().body("Could not find dot id"),
        Ok(dot_id) => dot_id.id,
    };

    // todo need some way to remove cache entries at some future date so we don't eventually run out of memory
    broadcaster.dot_ids.lock().insert(dot_key, dot_id);

    // Send position to all subscriber clients
    let message = serde_json::to_string(&BroadcastMessage {
        actor_id: position.actor_id,
        position: position.position,
    }).expect(""); // todo use ?

    {
        let clients = broadcaster.clients.lock();

        // todo remove clients on failure? or send ping periodically and remove like actix example?
        if let Some(senders) = clients.get(&position.script_id.to_string()) {
            let send_futures = senders
                .iter()
                .map(|s| s.send(sse::Data::new(message.clone())));

            let _ = future::join_all(send_futures).await;
        }
    }

    let result = sqlx::query!(
        "UPDATE read_position SET position = $2 WHERE id = $1",
        dot_id,
        position.position
    )
    .execute(&data.db)
    .await;

    match result {
        Ok(_) => HttpResponse::Ok().json("ok"),
        Err(_) => HttpResponse::InternalServerError().json("test"),
    }
}

#[get("/positions/{script_id}")]
pub async fn subscribe(
    data: web::Data<AppState>,
    broadcaster: web::Data<Broadcaster>,
    script_id: web::Path<i32>,
) -> impl Responder {
    let script_id = script_id.into_inner();

    let dots = sqlx::query!(
        "SELECT actor_id, position FROM read_position WHERE script_id = $1",
        script_id
    )
    .fetch_all(&data.db)
    .await;

    if let Ok(dots) = dots {
        let messages = dots
            .iter()
            .map(|r| {
                serde_json::to_string(&BroadcastMessage {
                    actor_id: r.actor_id,
                    position: r.position,
                }).expect("") // todo
            })
            .collect();

        broadcaster.new_client(script_id, messages).await
    } else {
        sse::channel(0).1 // return new rx channel which is dropped immediately to match the other return type
    }
}
