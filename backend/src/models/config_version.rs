use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use chrono::{DateTime, Utc};

#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct ConfigVersion {
    pub id: u64,
    pub server_id: u64,
    pub config: String,
    pub created_at: DateTime<Utc>,
    pub is_active: bool,
}

#[derive(Debug, Deserialize)]
pub struct CreateConfigVersionRequest {
    pub server_id: u64,
    pub config: String,
    pub is_active: Option<bool>,
}

#[derive(Debug, Deserialize)]
pub struct UpdateConfigVersionRequest {
    pub config: Option<String>,
    pub is_active: Option<bool>,
} 