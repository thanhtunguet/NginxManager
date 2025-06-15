use serde::{Deserialize, Serialize};
use sqlx::FromRow;

#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct ListeningPort {
    pub id: u64,
    pub name: String,
    pub port: u32,
    pub created_at: Option<chrono::DateTime<chrono::Utc>>,
}

#[derive(Debug, Deserialize)]
pub struct CreateListeningPortRequest {
    pub name: String,
    pub port: u32,
}

#[derive(Debug, Deserialize)]
pub struct UpdateListeningPortRequest {
    pub name: Option<String>,
    pub port: Option<u64>,
} 