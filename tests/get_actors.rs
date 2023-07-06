use play_reading_party::get_server;
use sqlx::{Pool, Postgres};
use std::net::TcpListener;

// We use sqlx::test so sqlx will create a database instance for the test,
// set it up based on the migration data, and shut it down upon success.
// The pool passed to the function is that created database.
#[sqlx::test]
async fn get_actors_works(pool: Pool<Postgres>) {
    // Arrange
    let address = spawn_app(pool.clone()).await;
    let client = reqwest::Client::new();

    // Insert a value into the empty db so we have something to get
    sqlx::query!("INSERT INTO actors (name) VALUES ($1)", "TestName")
        .execute(&pool)
        .await
        .unwrap();

    // Act
    let response = client
        .get(format!("{}/api/actors", address))
        .send()
        .await
        .unwrap();

    let status = response.status();
    let content = response.text().await.unwrap();
    let expected = "[{\"id\":1,\"name\":\"TestName\"}]";

    // Assert
    // Test for 200 status
    assert!(status.is_success());
    // Test for correct data retrieval
    assert_eq!(content, expected);
}

// Create a test application on a random port using the given database pool
async fn spawn_app(pool: Pool<Postgres>) -> String {
    let ip = "127.0.0.1";
    let listener = TcpListener::bind(format!("{}:0", ip))
        .expect("A random port should be able to be found to bind to");
    let port = listener.local_addr().unwrap().port();
    let address = format!("http://{}:{}", ip, port);

    let server = get_server(listener, pool.clone()).unwrap();
    let _ = tokio::spawn(server);
    address
}
