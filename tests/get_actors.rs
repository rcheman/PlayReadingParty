use play_reading_party::get_server;
use sqlx::{PgPool, Pool, Postgres};
use std::net::TcpListener;

// We use sqlx::test so sqlx will create a database instance for the test,
// set it up based on the migration data, and shut it down upon success.
// The pool passed to the function is that created database.
#[sqlx::test]
async fn get_actors_works(pool: Pool<Postgres>) {
    // Arrange
    let app = spawn_app(pool.clone()).await;
    let client = reqwest::Client::new();

    // Insert a value into the empty db so we have something to get
    sqlx::query!("INSERT INTO actors (name) VALUES ($1)", "TestName")
        .execute(&pool)
        .await
        .expect("Failed to insert test actor into database");

    // Act
    let response = client
        .get(format!("{}/api/actors", &app.address))
        .send()
        .await
        .expect("Failed to execute request.");

    let status = response.status();
    let content = response.text().await.expect("Failed to read content");
    let expected = "[{\"id\":1,\"name\":\"TestName\"}]";

    // Assert
    // Test for 200 status
    assert!(status.is_success());
    // Test for correct data retrieval
    assert_eq!(content, expected);
}

pub struct TestApp {
    pub address: String,
    pub db_pool: PgPool,
}

// Create a test application on a random port using the given database pool
async fn spawn_app(pool: Pool<Postgres>) -> TestApp {
    let listener = TcpListener::bind("127.0.0.1:0").expect("Failed to bind to random port");
    let port = listener.local_addr().unwrap().port();
    let address = format!("http://127.0.0.1:{}", port);

    let server = get_server(listener, pool.clone()).expect("Failed to bind address");
    let _ = tokio::spawn(server);
    TestApp {
        address,
        db_pool: pool,
    }
}
