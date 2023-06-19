use crate::AppState;
use actix_web::{get, web, HttpRequest, HttpResponse, Responder};
use serde::Serialize;
use std::collections::HashMap;

#[derive(Debug, Serialize)]
pub struct Character {
    name: String,
    line_count: i32,
    speaks_count: i32,
    id: String,
    actor_id: Option<i32>,
}

#[get("/characters/{script_id}")]
pub async fn get_characters(
    data: web::Data<AppState>,
    script_id: web::Path<i32>,
    req: HttpRequest,
) -> impl Responder {
    // Gets the optional query string out of the request and grabs the actor_id as an int
    let query = req.query_string();
    let actor_id: i32;
    if query != "" {
        actor_id = query.split('=').last().unwrap().parse::<i32>().unwrap();
    } else {
        actor_id = -1;
    }

    let result = sqlx::query!(
        "SELECT id, name, line_count, speaks_count, actor_id
        FROM characters
        WHERE ($1 = -1 or actor_id = $1)
        AND script_id = $2",
        actor_id,
        script_id.into_inner()
    )
    .fetch_all(&data.db)
    .await;

    if let Ok(result) = result {
        let mut characters_by_id: HashMap<String, Character> = HashMap::new();
        result.iter().for_each(|record| {
            characters_by_id.insert(
                record.id.to_string(),
                Character {
                    name: String::from(&record.name),
                    line_count: record.line_count,
                    speaks_count: record.speaks_count,
                    id: record.id.to_string(),
                    actor_id: record.actor_id,
                },
            );
        });
        HttpResponse::Ok().json(characters_by_id)
    } else {
        HttpResponse::BadRequest().json("no")
    }
}
