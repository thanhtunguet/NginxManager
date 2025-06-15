use validator::ValidationError;

pub fn validate_domain(domain: &str) -> Result<(), ValidationError> {
    if domain.is_empty() {
        return Err(ValidationError::new("domain_empty"));
    }

    // Basic domain validation
    if !domain.contains('.') {
        return Err(ValidationError::new("invalid_domain_format"));
    }

    // Check for valid characters
    if !domain.chars().all(|c| c.is_alphanumeric() || c == '.' || c == '-') {
        return Err(ValidationError::new("invalid_domain_characters"));
    }

    Ok(())
}

pub fn validate_port(port: u64) -> Result<(), ValidationError> {
    if port == 0 || port > 65535 {
        return Err(ValidationError::new("invalid_port_range"));
    }

    Ok(())
}

pub fn validate_ip_address(ip: &str) -> Result<(), ValidationError> {
    // Basic IP validation
    let parts: Vec<&str> = ip.split('.').collect();
    if parts.len() != 4 {
        return Err(ValidationError::new("invalid_ip_format"));
    }

    for part in parts {
        match part.parse::<u8>() {
            Ok(_) => continue,
            Err(_) => return Err(ValidationError::new("invalid_ip_octet")),
        }
    }

    Ok(())
}

pub fn validate_upstream_server(server: &str) -> Result<(), ValidationError> {
    if server.is_empty() {
        return Err(ValidationError::new("server_empty"));
    }

    // Check if it's an IP:port or hostname:port format
    if let Some((host, port)) = server.rsplit_once(':') {
        if host.is_empty() {
            return Err(ValidationError::new("invalid_server_host"));
        }
        
        if let Err(_) = port.parse::<u16>() {
            return Err(ValidationError::new("invalid_server_port"));
        }
    } else {
        return Err(ValidationError::new("missing_server_port"));
    }

    Ok(())
} 