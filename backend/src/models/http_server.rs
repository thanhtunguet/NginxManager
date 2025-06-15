use serde::{Deserialize, Serialize};
use sqlx::FromRow;

#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct HttpServer {
    pub id: u64,
    pub listening_port_id: u64,
    pub name: String,
    pub additional_config: String,
    pub status: ServerStatus,
    pub access_log_path: String,
    pub error_log_path: String,
    pub log_level: String,
}

#[derive(Debug, Serialize, Deserialize, sqlx::Type)]
#[sqlx(type_name = "ENUM('active', 'inactive')")]
pub enum ServerStatus {
    Active,
    Inactive,
}

#[derive(Debug, Deserialize)]
pub struct CreateHttpServerRequest {
    pub listening_port_id: u64,
    pub name: String,
    pub additional_config: Option<String>,
    pub access_log_path: Option<String>,
    pub error_log_path: Option<String>,
    pub log_level: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct UpdateHttpServerRequest {
    pub listening_port_id: Option<u64>,
    pub name: Option<String>,
    pub additional_config: Option<String>,
    pub status: Option<ServerStatus>,
    pub access_log_path: Option<String>,
    pub error_log_path: Option<String>,
    pub log_level: Option<String>,
} 