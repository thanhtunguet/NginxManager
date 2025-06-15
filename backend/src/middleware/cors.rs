use axum::{
    extract::Request,
    http::{header, Method},
    middleware::Next,
    response::Response,
};

pub async fn cors_middleware(
    request: Request,
    next: Next,
) -> Result<Response, axum::http::StatusCode> {
    let mut response = next.run(request).await;

    // Add CORS headers
    response.headers_mut().insert(
        header::ACCESS_CONTROL_ALLOW_ORIGIN,
        header::HeaderValue::from_static("*"),
    );
    response.headers_mut().insert(
        header::ACCESS_CONTROL_ALLOW_METHODS,
        header::HeaderValue::from_static("GET, POST, PUT, DELETE, OPTIONS"),
    );
    response.headers_mut().insert(
        header::ACCESS_CONTROL_ALLOW_HEADERS,
        header::HeaderValue::from_static("Content-Type, Authorization"),
    );

    Ok(response)
} 