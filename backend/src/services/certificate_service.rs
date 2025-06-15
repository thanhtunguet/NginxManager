use crate::models::Certificate;
use chrono::Utc;
use std::path::Path;

pub struct CertificateService;

impl CertificateService {
    pub fn new() -> Self {
        Self
    }

    pub fn validate_certificate(&self, cert_data: &str, private_key: &str) -> Result<bool, String> {
        // Basic validation - check if certificate and private key are not empty
        if cert_data.trim().is_empty() || private_key.trim().is_empty() {
            return Err("Certificate or private key is empty".to_string());
        }

        // Check if certificate starts with BEGIN CERTIFICATE
        if !cert_data.contains("-----BEGIN CERTIFICATE-----") {
            return Err("Invalid certificate format".to_string());
        }

        // Check if private key starts with BEGIN PRIVATE KEY or BEGIN RSA PRIVATE KEY
        if !private_key.contains("-----BEGIN PRIVATE KEY-----") 
            && !private_key.contains("-----BEGIN RSA PRIVATE KEY-----") {
            return Err("Invalid private key format".to_string());
        }

        Ok(true)
    }

    pub fn check_expiration(&self, certificate: &Certificate) -> CertificateStatus {
        let now = Utc::now();
        let days_until_expiry = (certificate.expired_at - now).num_days();

        match days_until_expiry {
            days if days < 0 => CertificateStatus::Expired,
            days if days <= 30 => CertificateStatus::ExpiringSoon(days),
            _ => CertificateStatus::Valid,
        }
    }

    pub fn should_renew(&self, certificate: &Certificate) -> bool {
        if !certificate.auto_renew {
            return false;
        }

        let now = Utc::now();
        let days_until_expiry = (certificate.expired_at - now).num_days();
        
        // Renew if certificate expires in 30 days or less
        days_until_expiry <= 30
    }

    pub fn save_certificate_files(&self, certificate: &Certificate, cert_dir: &Path) -> Result<(), std::io::Error> {
        let cert_path = cert_dir.join(format!("{}.crt", certificate.name));
        let key_path = cert_dir.join(format!("{}.key", certificate.name));

        std::fs::write(&cert_path, &certificate.certificate)?;
        std::fs::write(&key_path, &certificate.private_key)?;

        // Set proper permissions for private key
        #[cfg(unix)]
        {
            use std::os::unix::fs::PermissionsExt;
            let mut perms = std::fs::metadata(&key_path)?.permissions();
            perms.set_mode(0o600);
            std::fs::set_permissions(&key_path, perms)?;
        }

        Ok(())
    }
}

#[derive(Debug)]
pub enum CertificateStatus {
    Valid,
    ExpiringSoon(i64), // days until expiry
    Expired,
} 