use axum::{
    http::StatusCode,
    response::{IntoResponse, Response},
    Json,
};
use serde_json::json;
use thiserror::Error;

#[derive(Error, Debug)]
pub enum AppError {
    #[error("Database error: {0}")]
    Database(#[from] sqlx::Error),
    
    #[error("Validation error: {0}")]
    Validation(String),
    
    #[error("Authentication error: {0}")]
    Authentication(String),
    
    #[error("Configuration error: {0}")]
    Configuration(String),
    
    #[error("NGINX error: {0}")]
    Nginx(String),
    
    #[error("Certificate error: {0}")]
    Certificate(String),
    
    #[error("Internal server error")]
    Internal,
}

impl IntoResponse for AppError {
    fn into_response(self) -> Response {
        let (status, error_message) = match self {
            AppError::Database(e) => (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()),
            AppError::Validation(e) => (StatusCode::BAD_REQUEST, e),
            AppError::Authentication(e) => (StatusCode::UNAUTHORIZED, e),
            AppError::Configuration(e) => (StatusCode::INTERNAL_SERVER_ERROR, e),
            AppError::Nginx(e) => (StatusCode::INTERNAL_SERVER_ERROR, e),
            AppError::Certificate(e) => (StatusCode::BAD_REQUEST, e),
            AppError::Internal => (StatusCode::INTERNAL_SERVER_ERROR, "Internal server error".to_string()),
        };

        let body = Json(json!({
            "error": error_message,
            "status": status.as_u16()
        }));

        (status, body).into_response()
    }
} 