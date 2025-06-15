use axum::{http::StatusCode, Json};

pub async fn list_listening_ports() -> Result<Json<Vec<()>>, StatusCode> {
    Ok(Json(vec![]))
} 