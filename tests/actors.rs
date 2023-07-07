use crate::common::setup_test_environment;
use sqlx::{Pool, Postgres};

mod common;

// We use sqlx::test so sqlx will create a database instance for the test,
// set it up based on the migration data, and shut it down upon success.
// The pool passed to the function is that created database.
#[sqlx::test]
async fn get_actors(pool: Pool<Postgres>) {
    let app = setup_test_environment(&pool, "actors").await;

    // No actors
    let response = app.client.get(&app.url).send().await.unwrap();
    assert_eq!(response.status().as_u16(), 200);
    let content = response.text().await.unwrap();
    assert_eq!(content, "[]");

    // Single actor
    // Insert a value into the empty db so we have something to get
    sqlx::query!("INSERT INTO actors (name) VALUES ($1)", "TestName")
        .execute(&pool)
        .await
        .unwrap();

    let response = app.client.get(&app.url).send().await.unwrap();
    assert_eq!(response.status().as_u16(), 200);
    let expected = r#"[{"id":1,"name":"TestName"}]"#;
    let content = response.text().await.unwrap();
    assert_eq!(content, expected);

    // Many actors
    for n in 2..5 {
        sqlx::query!("INSERT INTO actors (name) VALUES ($1)", n.to_string())
            .execute(&pool)
            .await
            .unwrap();
    }

    let response = app.client.get(&app.url).send().await.unwrap();
    assert_eq!(response.status().as_u16(), 200);
    let expected = r#"[{"id":1,"name":"TestName"},{"id":2,"name":"2"},{"id":3,"name":"3"},{"id":4,"name":"4"}]"#;
    let content = response.text().await.unwrap();
    assert_eq!(content, expected);
}

#[sqlx::test]
async fn new_actor(pool: Pool<Postgres>) {
    let app = setup_test_environment(&pool, "actors").await;

    let long_name = "X".repeat(31);
    let max_name = "X".repeat(30);

    // Vec of (input, expected_status_code, expected_content
    let tests = vec![
        // Empty Body
        (
            400,
            String::from(""),
            String::from("Json deserialize error: EOF while parsing a value at line 1 column 0"),
        ),
        // Empty Name
        (
            400,
            String::from(r#"{"name": ""}"#),
            String::from("\"Actor name must be between 1 and 30 characters.\""),
        ),
        // Too long name
        (
            400,
            format!(r#"{{"name":"{}"}}"#, long_name),
            String::from("\"Actor name must be between 1 and 30 characters.\""),
        ),
        // Success
        (
            201,
            String::from(r#"{"name": "NewActorTest"}"#),
            String::from(r#"{"id":1,"name":"NewActorTest"}"#),
        ),
        // Max length name
        (
            201,
            format!(r#"{{"name":"{}"}}"#, max_name),
            format!(r#"{{"id":2,"name":"{}"}}"#, max_name),
        ),
        // Min length name
        (
            201,
            String::from(r#"{"name": "X"}"#),
            String::from(r#"{"id":3,"name":"X"}"#),
        ),
    ];

    for (status_code, input, expected) in tests {
        // Success Test
        let response = app
            .client
            .post(&app.url)
            .body(input)
            .header("Content-Type", "application/json")
            .send()
            .await
            .unwrap();

        assert_eq!(response.status().as_u16(), status_code);
        let content = response.text().await.unwrap();
        assert_eq!(content, expected);
    }
}

#[sqlx::test]
async fn delete_actor(pool: Pool<Postgres>) {
    let app = setup_test_environment(&pool, "actors").await;

    // Insert a value into the database so we have something to delete
    sqlx::query!("INSERT INTO actors (name) VALUES ($1)", "DeleteNameTest")
        .execute(&pool)
        .await
        .unwrap();

    let tests = vec![
        // No actor ID
        (404, "", ""),
        // Unknown actor ID
        (400, "2", ""),
        // Successful Delete
        (200, "1", "true"),
    ];

    for (status_code, actor_id, expected) in tests {
        // Success Test
        let response = app
            .client
            .delete(format!("{}/{}", &app.url, actor_id))
            .send()
            .await
            .unwrap();

        assert_eq!(response.status().as_u16(), status_code);
        let content = response.text().await.unwrap();
        assert_eq!(content, expected);
    }
}
