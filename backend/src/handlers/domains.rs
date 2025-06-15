use axum::{
    extract::{Path, State},
    http::StatusCode,
    Json,
};
use sqlx::MySqlPool;
use crate::models::{Domain, CreateDomainRequest};

pub async fn list_domains(
    State(pool): State<MySqlPool>,
) -> Result<Json<Vec<Domain>>, StatusCode> {
    let domains = sqlx::query_as::<_, Domain>(
        "SELECT * FROM Domain ORDER BY id"
    )
    .fetch_all(&pool)
    .await
    .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    Ok(Json(domains))
}

pub async fn create_domain(
    State(pool): State<MySqlPool>,
    Json(payload): Json<CreateDomainRequest>,
) -> Result<Json<Domain>, StatusCode> {
    let domain_id = sqlx::query!(
        "INSERT INTO Domain (domain) VALUES (?)",
        payload.domain
    )
    .execute(&pool)
    .await
    .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?
    .last_insert_id();

    let domain = sqlx::query_as::<_, Domain>(
        "SELECT * FROM Domain WHERE id = ?"
    )
    .bind(domain_id)
    .fetch_one(&pool)
    .await
    .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    Ok(Json(domain))
}

pub async fn delete_domain(
    State(pool): State<MySqlPool>,
    Path(id): Path<u64>,
) -> Result<StatusCode, StatusCode> {
    let result = sqlx::query("DELETE FROM Domain WHERE id = ?")
        .bind(id)
        .execute(&pool)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    if result.rows_affected() == 0 {
        return Err(StatusCode::NOT_FOUND);
    }

    Ok(StatusCode::NO_CONTENT)
} 