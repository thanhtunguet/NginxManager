use axum::{http::StatusCode, Json};

pub async fn list_access_rules() -> Result<Json<Vec<()>>, StatusCode> {
    Ok(Json(vec![]))
} 