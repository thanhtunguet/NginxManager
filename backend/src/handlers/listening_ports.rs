use axum::{
    extract::State,
    http::StatusCode,
    Json,
};
use sqlx::MySqlPool;
use crate::models::ListeningPort;

pub async fn list_listening_ports(
    State(pool): State<MySqlPool>,
) -> Result<Json<Vec<ListeningPort>>, StatusCode> {
    let listening_ports = sqlx::query_as!(
        ListeningPort,
        r#"
        SELECT id, name, port, created_at
        FROM listening_ports
        ORDER BY port
        "#
    )
    .fetch_all(&pool)
    .await
    .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    Ok(Json(listening_ports))
} 