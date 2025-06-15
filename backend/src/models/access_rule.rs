use serde::{Deserialize, Serialize};
use sqlx::FromRow;

#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct AccessRule {
    pub id: u64,
    pub server_id: Option<u64>,
    pub location_id: Option<u64>,
    pub ip_address: String,
    pub action: AccessAction,
    pub description: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, sqlx::Type)]
#[sqlx(type_name = "ENUM('allow', 'deny')")]
pub enum AccessAction {
    Allow,
    Deny,
}

#[derive(Debug, Deserialize)]
pub struct CreateAccessRuleRequest {
    pub server_id: Option<u64>,
    pub location_id: Option<u64>,
    pub ip_address: String,
    pub action: AccessAction,
    pub description: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct UpdateAccessRuleRequest {
    pub ip_address: Option<String>,
    pub action: Option<AccessAction>,
    pub description: Option<String>,
} 