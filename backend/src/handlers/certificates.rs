use axum::{
    extract::{Path, State},
    http::StatusCode,
    Json,
};
use sqlx::MySqlPool;
use crate::models::{Certificate, CreateCertificateRequest};

pub async fn list_certificates(
    State(pool): State<MySqlPool>,
) -> Result<Json<Vec<Certificate>>, StatusCode> {
    let certificates = sqlx::query_as::<_, Certificate>(
        "SELECT * FROM Certificate ORDER BY id"
    )
    .fetch_all(&pool)
    .await
    .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    Ok(Json(certificates))
}

pub async fn create_certificate(
    State(pool): State<MySqlPool>,
    Json(payload): Json<CreateCertificateRequest>,
) -> Result<Json<Certificate>, StatusCode> {
    let certificate_id = sqlx::query!(
        r#"
        INSERT INTO Certificate (name, certificate, privateKey, expiredAt, issuer, autoRenew)
        VALUES (?, ?, ?, ?, ?, ?)
        "#,
        payload.name,
        payload.certificate,
        payload.private_key,
        payload.expired_at,
        payload.issuer,
        payload.auto_renew.unwrap_or(false)
    )
    .execute(&pool)
    .await
    .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?
    .last_insert_id();

    let certificate = sqlx::query_as::<_, Certificate>(
        "SELECT * FROM Certificate WHERE id = ?"
    )
    .bind(certificate_id)
    .fetch_one(&pool)
    .await
    .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    Ok(Json(certificate))
}

pub async fn delete_certificate(
    State(pool): State<MySqlPool>,
    Path(id): Path<u64>,
) -> Result<StatusCode, StatusCode> {
    let result = sqlx::query("DELETE FROM Certificate WHERE id = ?")
        .bind(id)
        .execute(&pool)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    if result.rows_affected() == 0 {
        return Err(StatusCode::NOT_FOUND);
    }

    Ok(StatusCode::NO_CONTENT)
} 