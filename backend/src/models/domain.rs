use serde::{Deserialize, Serialize};
use sqlx::FromRow;

#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct Domain {
    pub id: u64,
    pub domain: String,
}

#[derive(Debug, Deserialize)]
pub struct CreateDomainRequest {
    pub domain: String,
}

#[derive(Debug, Deserialize)]
pub struct UpdateDomainRequest {
    pub domain: String,
} 