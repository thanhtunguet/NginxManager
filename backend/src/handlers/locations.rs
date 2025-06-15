use axum::{http::StatusCode, Json};
use sqlx::MySqlPool;

pub async fn list_locations(
    _pool: sqlx::MySqlPool,
) -> Result<Json<Vec<()>>, StatusCode> {
    Ok(Json(vec![]))
} 