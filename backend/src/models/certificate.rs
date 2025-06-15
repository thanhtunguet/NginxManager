use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use chrono::{DateTime, Utc};

#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct Certificate {
    pub id: u64,
    pub name: String,
    pub certificate: String,
    pub private_key: String,
    pub expired_at: DateTime<Utc>,
    pub issuer: String,
    pub auto_renew: bool,
}

#[derive(Debug, Deserialize)]
pub struct CreateCertificateRequest {
    pub name: String,
    pub certificate: String,
    pub private_key: String,
    pub expired_at: DateTime<Utc>,
    pub issuer: String,
    pub auto_renew: Option<bool>,
}

#[derive(Debug, Deserialize)]
pub struct UpdateCertificateRequest {
    pub name: Option<String>,
    pub certificate: Option<String>,
    pub private_key: Option<String>,
    pub expired_at: Option<DateTime<Utc>>,
    pub issuer: Option<String>,
    pub auto_renew: Option<bool>,
} 