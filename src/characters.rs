use crate::AppState;
use actix_web::{get, web, HttpResponse, Responder};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Character {
    name: String,
    line_count: u32,
    speaks_count: u32,
    id: u32,
    actor_id: Option<i32>,
}

#[derive(Deserialize)]
pub struct Query {
    actor_id: Option<i32>,
}

#[get("/characters/{script_id}")]
pub async fn get_characters(
    data: web::Data<AppState>,
    script_id: web::Path<i32>,
    query: web::Query<Query>,
) -> impl Responder {
    // Optional query parameter to filter characters by the actor id
    let actor_id = query.actor_id.unwrap_or(-1);

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
        // Return a hashmap of Character objects indexed by the character ids
        let characters_by_id: HashMap<String, Character> = result
            .iter()
            .map(|record| {
                return (
                    record.id.to_string(),
                    Character {
                        name: String::from(&record.name),
                        line_count: record.line_count as u32,
                        speaks_count: record.speaks_count as u32,
                        id: record.id as u32,
                        actor_id: record.actor_id,
                    },
                );
            })
            .collect();
        HttpResponse::Ok().json(characters_by_id)
    } else {
        HttpResponse::BadRequest().json("no")
    }
}
