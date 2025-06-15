use axum::{http::StatusCode, Json};

pub async fn list_config_versions() -> Result<Json<Vec<()>>, StatusCode> {
    Ok(Json(vec![]))
} 