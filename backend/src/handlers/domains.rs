use axum::{
    extract::State,
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