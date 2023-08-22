use crate::AppState;
use actix_web::{get, post, web, HttpResponse, Responder};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Debug, Serialize, PartialEq)]
#[serde(rename_all = "camelCase")]
pub struct Character {
    pub name: String,
    pub line_count: u32,
    pub speaks_count: u32,
    pub id: Option<u32>,
    pub actor_id: Option<i32>,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Query {
    actor_id: Option<i32>,
}

// Get all the characters, or optionally, get all the characters assigned to a specific actor
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
                (
                    record.id.to_string(),
                    Character {
                        name: String::from(&record.name),
                        line_count: record.line_count as u32,
                        speaks_count: record.speaks_count as u32,
                        id: Some(record.id as u32),
                        actor_id: record.actor_id,
                    },
                )
            })
            .collect();
        HttpResponse::Ok().json(characters_by_id)
    } else {
        HttpResponse::InternalServerError().finish()
    }
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct NewAssignment {
    actor_id: Option<i32>,
    character_id: i32,
}

// Assign a character to an actor. Return a boolean for whether the query went through
#[post("/characters/{script_id}/assignCharacter")]
pub async fn assign_character(
    data: web::Data<AppState>,
    script_id: web::Path<i32>,
    new_assignment: web::Json<NewAssignment>,
) -> impl Responder {
    // actor_id is an Option because null is passed when a character is being unassigned
    let NewAssignment {
        actor_id,
        character_id,
    } = new_assignment.into_inner();
    let script_id = script_id.into_inner();
    let result = sqlx::query!(
        "UPDATE characters
    SET actor_id = $1
    WHERE script_id = $2 AND id = $3
    RETURNING *",
        actor_id,
        script_id,
        character_id
    )
    .fetch_one(&data.db)
    .await;

    if result.is_ok() {
        HttpResponse::Ok().json(true)
    } else {
        HttpResponse::InternalServerError().finish()
    }
}
