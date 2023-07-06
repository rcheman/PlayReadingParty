use crate::common::spawn_app;
use sqlx::{Pool, Postgres};
use std::collections::HashMap;

mod common;

// We use sqlx::test so sqlx will create a database instance for the test,
// set it up based on the migration data, and shut it down upon success.
// The pool passed to the function is that created database.
#[sqlx::test]
async fn get_actors_works(pool: Pool<Postgres>) {
    let app = spawn_app(&pool, "actors").await;
    // Insert a value into the empty db so we have something to get
    sqlx::query!("INSERT INTO actors (name) VALUES ($1)", "TestName")
        .execute(&pool)
        .await
        .unwrap();

    let response = app.client.get(app.url).send().await.unwrap();

    assert_eq!(response.status().as_u16(), 200);
    let expected = r#"[{"id":1,"name":"TestName"}]"#;
    let content = response.text().await.unwrap();
    assert_eq!(content, expected);
}

#[sqlx::test]
async fn new_actor_works(pool: Pool<Postgres>) {
    let app = spawn_app(&pool, "actors").await;

    // Success Test
    let response = app
        .client
        .post(&app.url)
        .body(r#"{"name": "NewActorTest"}"#)
        .header("Content-Type", "application/json")
        .send()
        .await
        .unwrap();

    assert_eq!(response.status().as_u16(), 201);
    let content = response.text().await.unwrap();
    let expected = r#"{"id":1,"name":"NewActorTest"}"#;
    assert_eq!(content, expected);

    // Empty Body Test
    let response = app
        .client
        .post(&app.url)
        .body("")
        .header("Content-Type", "application/json")
        .send()
        .await
        .unwrap();
    assert_eq!(response.status().as_u16(), 400);

    // Empty Name Test;
    let response = app
        .client
        .post(&app.url)
        .body(r#"{"name": ""}"#)
        .header("Content-Type", "application/json")
        .send()
        .await
        .unwrap();
    assert_eq!(response.status().as_u16(), 400);

    // Too Long Name Test
    let mut long_name = HashMap::new();
    long_name.insert("name", String::from_utf8(vec![b'X'; 31]).unwrap());
    let response = app
        .client
        .post(&app.url)
        .json(&long_name)
        .send()
        .await
        .unwrap();
    assert_eq!(response.status().as_u16(), 400);

    // Right Name Length Test
    let mut long_name = HashMap::new();
    long_name.insert("name", String::from_utf8(vec![b'X'; 30]).unwrap());
    let response = app
        .client
        .post(&app.url)
        .json(&long_name)
        .send()
        .await
        .unwrap();
    assert_eq!(response.status().as_u16(), 201);
}

#[sqlx::test]
async fn delete_actor_works(pool: Pool<Postgres>) {
    let app = spawn_app(&pool, "actors").await;

    // No actor ID Test
    let response = app.client.delete(&app.url).send().await.unwrap();
    assert_eq!(response.status().as_u16(), 404);

    // Unknown actor ID Test
    let response = app
        .client
        .delete(format!("{}/34", &app.url))
        .send()
        .await
        .unwrap();
    assert_eq!(response.status().as_u16(), 400);

    // Successful Delete Test
    // Insert a value into the database so we have something to delete
    sqlx::query!("INSERT INTO actors (name) VALUES ($1)", "DeleteNameTest")
        .execute(&pool)
        .await
        .unwrap();
    let response = app
        .client
        .delete(format!("{}/1", &app.url))
        .send()
        .await
        .unwrap();
    assert_eq!(response.status().as_u16(), 200);
    let content = response.text().await.unwrap();
    assert_eq!(content, "true");
}
