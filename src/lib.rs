use crate::actors::{delete_actor, get_actors, new_actor};
use crate::characters::{get_characters, assign_character};
use actix_web::dev::Server;
use actix_web::{web, App, HttpServer};
use dotenvy::dotenv;
use sqlx::postgres::PgPoolOptions;
use sqlx::PgPool;

mod actors;
mod characters;

pub struct AppState {
    db: PgPool,
}

pub async fn run() -> Result<Server, std::io::Error> {
    dotenv().ok();

    let database_uri = std::env::var("DATABASE_URL").expect("DATABASE_URL must be set");
    let pool = match PgPoolOptions::new()
        .max_connections(128)
        .connect(&database_uri)
        .await
    {
        Ok(pool) => {
            println!("✅Connection to the database is successful!");
            pool
        }
        Err(err) => {
            println!("🔥 Failed to connect to the database: {:?}", err);
            std::process::exit(1);
        }
    };

    let server = HttpServer::new(move || {
        App::new()
            .app_data(web::Data::new(AppState { db: pool.clone() }))
            .service(
                web::scope("/api")
                    .service(get_actors)
                    .service(new_actor)
                    .service(delete_actor)
                    .service(get_characters)
                    .service(assign_character),
            )
    })
    .bind(("127.0.0.1", 8000))?
    .run();
    Ok(server)
}
