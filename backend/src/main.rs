use axum::{
    routing::{get, post},
    Router,
};
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

    // Build our application with a route
    let app = Router::new()
        .route("/health", get(health_check))
        .route("/api/v1/upstreams", get(handlers::upstreams::list_upstreams))
        .route("/api/v1/upstreams", post(handlers::upstreams::create_upstream))
        .route("/api/v1/servers", get(handlers::servers::list_servers))
        .route("/api/v1/servers", post(handlers::servers::create_server))
        .route("/api/v1/domains", get(handlers::domains::list_domains))
        .route("/api/v1/domains", post(handlers::domains::create_domain))
        .route("/api/v1/certificates", get(handlers::certificates::list_certificates))
        .route("/api/v1/certificates", post(handlers::certificates::create_certificate));

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