use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use chrono::{DateTime, Utc};

#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct Upstream {
    pub id: u64,
    pub name: String,
    pub server: String,
    pub keep_alive: u64,
    pub status: UpstreamStatus,
    pub health_check_path: String,
    pub health_check_interval: u64,
    pub max_fails: u64,
}

#[derive(Debug, Serialize, Deserialize, sqlx::Type)]
#[sqlx(type_name = "ENUM('active', 'inactive')")]
pub enum UpstreamStatus {
    Active,
    Inactive,
}

#[derive(Debug, Deserialize)]
pub struct CreateUpstreamRequest {
    pub name: String,
    pub server: String,
    pub keep_alive: u64,
    pub health_check_path: String,
    pub health_check_interval: Option<u64>,
    pub max_fails: Option<u64>,
}

#[derive(Debug, Deserialize)]
pub struct UpdateUpstreamRequest {
    pub name: Option<String>,
    pub server: Option<String>,
    pub keep_alive: Option<u64>,
    pub status: Option<UpstreamStatus>,
    pub health_check_path: Option<String>,
    pub health_check_interval: Option<u64>,
    pub max_fails: Option<u64>,
} 