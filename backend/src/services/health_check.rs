use crate::models::Upstream;
use reqwest::Client;
use std::time::Duration;
use tokio::time::timeout;

pub struct HealthCheckService {
    client: Client,
}

impl HealthCheckService {
    pub fn new() -> Self {
        let client = Client::builder()
            .timeout(Duration::from_secs(10))
            .build()
            .expect("Failed to create HTTP client");

        Self { client }
    }

    pub async fn check_upstream_health(&self, upstream: &Upstream) -> HealthStatus {
        if upstream.status != crate::models::UpstreamStatus::Active {
            return HealthStatus::Inactive;
        }

        let url = format!("http://{}{}", upstream.server, upstream.health_check_path);
        
        match timeout(Duration::from_secs(5), self.client.get(&url).send()).await {
            Ok(Ok(response)) => {
                if response.status().is_success() {
                    HealthStatus::Healthy
                } else {
                    HealthStatus::Unhealthy(format!("HTTP {}", response.status()))
                }
            }
            Ok(Err(e)) => HealthStatus::Unhealthy(e.to_string()),
            Err(_) => HealthStatus::Unhealthy("Timeout".to_string()),
        }
    }

    pub async fn check_nginx_status(&self) -> HealthStatus {
        // Check if nginx process is running
        match std::process::Command::new("nginx")
            .arg("-t")
            .output() {
            Ok(output) => {
                if output.status.success() {
                    HealthStatus::Healthy
                } else {
                    HealthStatus::Unhealthy("NGINX configuration is invalid".to_string())
                }
            }
            Err(e) => HealthStatus::Unhealthy(format!("NGINX not available: {}", e)),
        }
    }

    pub async fn check_database_connection(&self, pool: &sqlx::MySqlPool) -> HealthStatus {
        match sqlx::query("SELECT 1").execute(pool).await {
            Ok(_) => HealthStatus::Healthy,
            Err(e) => HealthStatus::Unhealthy(format!("Database error: {}", e)),
        }
    }
}

#[derive(Debug, Clone)]
pub enum HealthStatus {
    Healthy,
    Unhealthy(String),
    Inactive,
} 