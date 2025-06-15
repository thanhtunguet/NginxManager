use axum::{
    extract::{Path, State},
    http::StatusCode,
    Json,
};
use sqlx::MySqlPool;
use crate::models::{HttpServer, CreateHttpServerRequest};

pub async fn list_servers(
    State(pool): State<MySqlPool>,
) -> Result<Json<Vec<HttpServer>>, StatusCode> {
    let servers = sqlx::query_as::<_, HttpServer>(
        "SELECT * FROM HttpServer ORDER BY id"
    )
    .fetch_all(&pool)
    .await
    .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    Ok(Json(servers))
}

pub async fn create_server(
    State(pool): State<MySqlPool>,
    Json(payload): Json<CreateHttpServerRequest>,
) -> Result<Json<HttpServer>, StatusCode> {
    let server_id = sqlx::query!(
        r#"
        INSERT INTO HttpServer (listeningPortId, name, additionalConfig, accessLogPath, errorLogPath, logLevel)
        VALUES (?, ?, ?, ?, ?, ?)
        "#,
        payload.listening_port_id,
        payload.name,
        payload.additional_config.unwrap_or_default(),
        payload.access_log_path.unwrap_or_else(|| "/dev/null".to_string()),
        payload.error_log_path.unwrap_or_else(|| "/dev/null".to_string()),
        payload.log_level.unwrap_or_else(|| "warn".to_string())
    )
    .execute(&pool)
    .await
    .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?
    .last_insert_id();

    let server = sqlx::query_as::<_, HttpServer>(
        "SELECT * FROM HttpServer WHERE id = ?"
    )
    .bind(server_id)
    .fetch_one(&pool)
    .await
    .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    Ok(Json(server))
}

pub async fn delete_server(
    State(pool): State<MySqlPool>,
    Path(id): Path<u64>,
) -> Result<StatusCode, StatusCode> {
    let result = sqlx::query("DELETE FROM HttpServer WHERE id = ?")
        .bind(id)
        .execute(&pool)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    if result.rows_affected() == 0 {
        return Err(StatusCode::NOT_FOUND);
    }

    Ok(StatusCode::NO_CONTENT)
} 