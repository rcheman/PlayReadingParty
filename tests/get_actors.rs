#[tokio::test]
async fn get_actors_works() {
    // Arrange
    spawn_app().await;
    let client = reqwest::Client::new();
    // Act
    let response = client
        .get("http://127.0.0.1:8000/api/actors")
        .send()
        .await
        .expect("Failed to execute request.");
    // Assert
    assert!(response.status().is_success());
}

async fn spawn_app() {
    let server = play_reading_party::run()
        .await
        .expect("Failed to bind address");
    let _ = tokio::spawn(server);
}
