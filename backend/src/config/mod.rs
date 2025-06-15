use serde::Deserialize;
use std::env;

#[derive(Debug, Deserialize)]
pub struct Config {
    pub database: DatabaseConfig,
    pub server: ServerConfig,
    pub jwt: JwtConfig,
}

#[derive(Debug, Deserialize)]
pub struct DatabaseConfig {
    pub url: String,
}

#[derive(Debug, Deserialize)]
pub struct ServerConfig {
    pub host: String,
    pub port: u16,
}

#[derive(Debug, Deserialize)]
pub struct JwtConfig {
    pub secret: String,
    pub expiration_hours: u64,
}

impl Config {
    pub fn load() -> Result<Self, config::ConfigError> {
        dotenv::dotenv().ok();

        let mut builder = config::Config::builder()
            .set_default("server.host", "127.0.0.1")?
            .set_default("server.port", 3000)?
            .set_default("jwt.expiration_hours", 24)?;

        // Load from environment variables
        if let Ok(database_url) = env::var("DATABASE_URL") {
            builder = builder.set_override("database.url", database_url)?;
        }

        if let Ok(jwt_secret) = env::var("JWT_SECRET") {
            builder = builder.set_override("jwt.secret", jwt_secret)?;
        }

        builder.build()?.try_deserialize()
    }
} 