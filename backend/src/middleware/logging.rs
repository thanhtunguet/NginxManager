use axum::{
    http::{StatusCode, Request},
    middleware::Next,
    response::Response,
};
use std::time::Instant;
use tracing::info;

pub async fn logging_middleware<B>(
    request: Request<B>,
    next: Next<B>,
) -> Result<Response, StatusCode> {
    let start = Instant::now();
    let method = request.method().clone();
    let uri = request.uri().clone();
    let version = request.version();

    let response = next.run(request).await;

    let latency = start.elapsed();
    let status = response.status();

    info!(
        target: "http_request",
        method = %method,
        uri = %uri,
        version = ?version,
        status = %status,
        latency = ?latency,
    );

    Ok(response)
} 