use actix_web::{HttpResponse, Responder, web, get};
use serde::Serialize;
use crate::AppState;

#[derive(Debug, Serialize)]
struct Actor {
    id: i32,
    name: String
}

#[get("/actors")]
pub async fn get_actors(data: web::Data<AppState>) -> impl Responder {
    let result = sqlx::query!("SELECT * FROM actors")
        .fetch_all(&data.db)
        .await;

    if let Ok(result) = result {
        HttpResponse::Ok().json(result
            .iter()
            .map(|record| {
                // let mut name = ;
                // name.push_str("rusty-rachel");

                Actor { id: record.id, name: String::from(&record.name) }
            })
            .collect::<Vec<_>>()
        )
    } else {
        HttpResponse::BadRequest().json("no")
    }

}

// async fn new_actor() -> impl Responder {
//     todo!()
// }
//
// async fn delete_actor(database: web::Data<PgPool>) -> impl Responder {
//     todo!()
// }
