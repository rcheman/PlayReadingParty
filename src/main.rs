use dotenvy::dotenv;
use play_reading_party::{configure_database, get_server, migrate_database};
use std::net::TcpListener;

#[tokio::main]
// Run the main server for the application
async fn main() -> Result<(), std::io::Error> {
    dotenv().ok();
    let listener = TcpListener::bind("127.0.0.1:8000").expect("Failed to bind to port");
    let database_uri = std::env::var("DATABASE_URL").expect("DATABASE_URL must be set");
    let db_pool = configure_database(database_uri);
    let migrated_pool = migrate_database(db_pool);
    get_server(listener, migrated_pool.await)?.await
}
