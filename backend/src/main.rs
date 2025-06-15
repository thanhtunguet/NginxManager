use axum::{
    routing::{get, post, delete},
    Router,
};
use sqlx::mysql::MySqlPoolOptions;
use std::net::SocketAddr;
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};

mod config;
mod handlers;
mod middleware;
mod models;
mod services;
mod utils;

#[tokio::main]
async fn main() {
    // Initialize tracing
    tracing_subscriber::registry()
        .with(tracing_subscriber::EnvFilter::new(
            std::env::var("RUST_LOG").unwrap_or_else(|_| "info".into()),
        ))
        .with(tracing_subscriber::fmt::layer())
        .init();

    // Load configuration
    let config = config::Config::load().expect("Failed to load configuration");

    // Create the database pool
    let pool = MySqlPoolOptions::new()
        .max_connections(5)
        .connect(&config.database.url)
        .await
        .expect("Failed to create database pool");

    // Build our application with a route
    let app = Router::new()
        .route("/health", get(health_check))
        .route("/api/v1/upstreams", get(handlers::upstreams::list_upstreams))
        .route("/api/v1/upstreams", post(handlers::upstreams::create_upstream))
        .route("/api/v1/upstreams/:id", delete(handlers::upstreams::delete_upstream))
        .route("/api/v1/servers", get(handlers::servers::list_servers))
        .route("/api/v1/servers", post(handlers::servers::create_server))
        .route("/api/v1/servers/:id", delete(handlers::servers::delete_server))
        .route("/api/v1/domains", get(handlers::domains::list_domains))
        .route("/api/v1/domains", post(handlers::domains::create_domain))
        .route("/api/v1/domains/:id", delete(handlers::domains::delete_domain))
        .route("/api/v1/certificates", get(handlers::certificates::list_certificates))
        .route("/api/v1/certificates", post(handlers::certificates::create_certificate))
        .route("/api/v1/certificates/:id", delete(handlers::certificates::delete_certificate))
        .route("/api/v1/listening-ports", get(handlers::listening_ports::list_listening_ports))
        .with_state(pool);

    // Run it
    let addr = SocketAddr::from(([127, 0, 0, 1], 3000));
    tracing::info!("listening on {}", addr);
    axum::Server::bind(&addr)
        .serve(app.into_make_service())
        .await
        .unwrap();
}

async fn health_check() -> &'static str {
    "OK"
} 