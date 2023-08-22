use crate::actors::{delete_actor, get_actors, new_actor};
use crate::characters::{assign_character, get_characters};
use crate::reading_dots::{report_position, subscribe, Broadcaster};
use actix_web::dev::Server;
use actix_web::{middleware, web, App, HttpServer};
use sqlx::PgPool;
use std::net::TcpListener;
use std::sync::Arc;

mod actors;
mod characters;
mod reading_dots;
mod script_parser;

pub struct AppState {
    db: PgPool,
}

/// Creates an HTTP server with the given listener and sets the database pool in the app state.
/// All endpoints from this server start at /api
pub fn get_server(listener: TcpListener, db_pool: PgPool) -> Result<Server, std::io::Error> {
    let broadcaster = Broadcaster::new();

    let server = HttpServer::new(move || {
        App::new()
            .app_data(web::Data::new(AppState {
                db: db_pool.clone(),
            }))
            .app_data(web::Data::from(Arc::clone(&broadcaster)))
            .wrap(middleware::Compress::default()) // compress responses
            .service(
                web::scope("/api")
                    .service(get_actors)
                    .service(new_actor)
                    .service(delete_actor)
                    .service(get_characters)
                    .service(assign_character)
                    .service(report_position)
                    .service(subscribe),
            )
    })
    .listen(listener)?
    .run();
    Ok(server)
}

/// Connects to the database based on the given connection_string and returns out the pool
pub fn configure_database(connection_string: String) -> PgPool {
    let pool = match PgPool::connect_lazy(&connection_string) {
        Ok(pool) => {
            println!("✅Connection to the database is successful!");
            pool
        }
        Err(err) => {
            println!("🔥 Failed to connect to the database: {:?}", err);
            std::process::exit(1);
        }
    };
    pool
}

/// Migrates the given database according to the local migrations folder
pub async fn migrate_database(pool: &PgPool) {
    sqlx::migrate!("./migrations")
        .run(pool)
        .await
        .expect("Valid migrations should exist in migrations/");
}
