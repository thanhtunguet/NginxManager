use axum::{
    extract::{Path, State},
    http::StatusCode,
    Json,
};
use sqlx::MySqlPool;
use crate::models::{Upstream, CreateUpstreamRequest, UpdateUpstreamRequest};

pub async fn list_upstreams(
    State(pool): State<MySqlPool>,
) -> Result<Json<Vec<Upstream>>, StatusCode> {
    let upstreams = sqlx::query_as::<_, Upstream>(
        "SELECT * FROM Upstream ORDER BY id"
    )
    .fetch_all(&pool)
    .await
    .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    Ok(Json(upstreams))
}

pub async fn get_upstream(
    State(pool): State<MySqlPool>,
    Path(id): Path<u64>,
) -> Result<Json<Upstream>, StatusCode> {
    let upstream = sqlx::query_as::<_, Upstream>(
        "SELECT * FROM Upstream WHERE id = ?"
    )
    .bind(id)
    .fetch_optional(&pool)
    .await
    .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?
    .ok_or(StatusCode::NOT_FOUND)?;

    Ok(Json(upstream))
}

pub async fn create_upstream(
    State(pool): State<MySqlPool>,
    Json(payload): Json<CreateUpstreamRequest>,
) -> Result<Json<Upstream>, StatusCode> {
    let upstream_id = sqlx::query!(
        r#"
        INSERT INTO Upstream (name, server, keepAlive, healthCheckPath, healthCheckInterval, maxFails)
        VALUES (?, ?, ?, ?, ?, ?)
        "#,
        payload.name,
        payload.server,
        payload.keep_alive,
        payload.health_check_path,
        payload.health_check_interval.unwrap_or(50),
        payload.max_fails.unwrap_or(3)
    )
    .execute(&pool)
    .await
    .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?
    .last_insert_id();

    let upstream = sqlx::query_as::<_, Upstream>(
        "SELECT * FROM Upstream WHERE id = ?"
    )
    .bind(upstream_id)
    .fetch_one(&pool)
    .await
    .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    Ok(Json(upstream))
}

pub async fn update_upstream(
    State(pool): State<MySqlPool>,
    Path(id): Path<u64>,
    Json(payload): Json<UpdateUpstreamRequest>,
) -> Result<Json<Upstream>, StatusCode> {
    // First check if upstream exists
    let existing = sqlx::query_as::<_, Upstream>(
        "SELECT * FROM Upstream WHERE id = ?"
    )
    .bind(id)
    .fetch_optional(&pool)
    .await
    .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?
    .ok_or(StatusCode::NOT_FOUND)?;

    // Build update query dynamically
    let mut query = String::from("UPDATE Upstream SET ");
    let mut params: Vec<String> = Vec::new();
    let mut values: Vec<Box<dyn sqlx::Encode<'_, sqlx::MySql> + Send + Sync>> = Vec::new();

    if let Some(name) = payload.name {
        params.push("name = ?".to_string());
        values.push(Box::new(name));
    }
    if let Some(server) = payload.server {
        params.push("server = ?".to_string());
        values.push(Box::new(server));
    }
    if let Some(keep_alive) = payload.keep_alive {
        params.push("keepAlive = ?".to_string());
        values.push(Box::new(keep_alive));
    }
    if let Some(status) = payload.status {
        params.push("status = ?".to_string());
        values.push(Box::new(status));
    }
    if let Some(health_check_path) = payload.health_check_path {
        params.push("healthCheckPath = ?".to_string());
        values.push(Box::new(health_check_path));
    }
    if let Some(health_check_interval) = payload.health_check_interval {
        params.push("healthCheckInterval = ?".to_string());
        values.push(Box::new(health_check_interval));
    }
    if let Some(max_fails) = payload.max_fails {
        params.push("maxFails = ?".to_string());
        values.push(Box::new(max_fails));
    }

    if params.is_empty() {
        return Ok(Json(existing));
    }

    query.push_str(&params.join(", "));
    query.push_str(" WHERE id = ?");

    // Execute update
    sqlx::query(&query)
        .execute(&pool)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    // Fetch updated upstream
    let upstream = sqlx::query_as::<_, Upstream>(
        "SELECT * FROM Upstream WHERE id = ?"
    )
    .bind(id)
    .fetch_one(&pool)
    .await
    .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    Ok(Json(upstream))
}

pub async fn delete_upstream(
    State(pool): State<MySqlPool>,
    Path(id): Path<u64>,
) -> Result<StatusCode, StatusCode> {
    let result = sqlx::query("DELETE FROM Upstream WHERE id = ?")
        .bind(id)
        .execute(&pool)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    if result.rows_affected() == 0 {
        return Err(StatusCode::NOT_FOUND);
    }

    Ok(StatusCode::NO_CONTENT)
} 