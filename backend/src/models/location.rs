use serde::{Deserialize, Serialize};
use sqlx::FromRow;

#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct Location {
    pub id: u64,
    pub server_id: u64,
    pub upstream_id: u64,
    pub additional_config: String,
    pub client_max_body_size: String,
}

#[derive(Debug, Deserialize)]
pub struct CreateLocationRequest {
    pub server_id: u64,
    pub upstream_id: u64,
    pub additional_config: Option<String>,
    pub client_max_body_size: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct UpdateLocationRequest {
    pub upstream_id: Option<u64>,
    pub additional_config: Option<String>,
    pub client_max_body_size: Option<String>,
} 