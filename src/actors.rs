use crate::AppState;
use actix_web::{delete, get, post, web, HttpResponse, Responder};
use serde::{Deserialize, Serialize};
use serde_json::json;

#[derive(Debug, Serialize)]
struct Actor {
    id: i32,
    name: String,
}

#[get("/actors")]
pub async fn get_actors(data: web::Data<AppState>) -> impl Responder {
    let result = sqlx::query!("SELECT * FROM actors")
        .fetch_all(&data.db)
        .await;

    if let Ok(result) = result {
        HttpResponse::Ok().json(
            result
                .iter()
                .map(|record| Actor {
                    id: record.id,
                    name: String::from(&record.name),
                })
                .collect::<Vec<Actor>>(),
        )
    } else {
        HttpResponse::BadRequest().finish()
    }
}

#[derive(Debug, Deserialize)]
pub struct NewActor {
    name: String,
}

#[post("/actors")]
pub async fn new_actor(
    data: web::Data<AppState>,
    new_actor: web::Json<NewActor>,
) -> impl Responder {
    let name = new_actor.into_inner().name;
    let name_length = name.chars().count();
    // Limit name length to 30 characters so the reading dots aren't huge
    if name_length > 30 || name_length == 0 {
        return HttpResponse::BadRequest().json("Actor name must be between 1 and 30 characters.");
    }
    let result = sqlx::query!("INSERT INTO actors (name) VALUES ($1) RETURNING ID", name)
        .fetch_one(&data.db)
        .await;

    if let Ok(result) = result {
        HttpResponse::Created().json(json!({
            "id": result.id,
            "name": name
        }))
    } else {
        HttpResponse::BadRequest().finish()
    }
}

#[delete("/actors/{id}")]
pub async fn delete_actor(data: web::Data<AppState>, id: web::Path<i32>) -> impl Responder {
    let result = sqlx::query!(
        "DELETE FROM actors WHERE id = $1 RETURNING *",
        id.into_inner()
    )
    .fetch_one(&data.db)
    .await;

    if result.is_ok() {
        HttpResponse::Ok().json(true)
    } else {
        HttpResponse::BadRequest().finish()
    }
}
