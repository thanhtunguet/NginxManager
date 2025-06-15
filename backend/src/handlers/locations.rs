use axum::{http::StatusCode, Json};

pub async fn list_locations(
    _pool: sqlx::MySqlPool,
) -> Result<Json<Vec<()>>, StatusCode> {
    Ok(Json(vec![]))
} 