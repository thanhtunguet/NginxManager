use crate::models::{HttpServer, Upstream, Location, Domain, Certificate};
use tera::{Tera, Context};
use std::collections::HashMap;

pub struct NginxConfigService {
    tera: Tera,
}

impl NginxConfigService {
    pub fn new() -> Result<Self, tera::Error> {
        let tera = Tera::new("templates/**/*")?;
        Ok(Self { tera })
    }

    pub fn generate_upstream_config(&self, upstream: &Upstream) -> Result<String, tera::Error> {
        let mut context = Context::new();
        context.insert("upstream", upstream);
        
        self.tera.render("upstream.conf", &context)
    }

    pub fn generate_server_config(
        &self,
        server: &HttpServer,
        domains: &[Domain],
        locations: &[Location],
        upstreams: &[Upstream],
        certificates: &[Certificate],
    ) -> Result<String, tera::Error> {
        let mut context = Context::new();
        context.insert("server", server);
        context.insert("domains", domains);
        context.insert("locations", locations);
        context.insert("upstreams", upstreams);
        context.insert("certificates", certificates);
        
        self.tera.render("server.conf", &context)
    }

    pub fn generate_main_config(&self, servers: &[HttpServer]) -> Result<String, tera::Error> {
        let mut context = Context::new();
        context.insert("servers", servers);
        
        self.tera.render("nginx.conf", &context)
    }

    pub fn validate_config(&self, config: &str) -> Result<bool, std::io::Error> {
        // Write config to temporary file
        let temp_path = std::env::temp_dir().join("nginx_test.conf");
        std::fs::write(&temp_path, config)?;
        
        // Run nginx -t to validate
        let output = std::process::Command::new("nginx")
            .arg("-t")
            .arg("-c")
            .arg(&temp_path)
            .output()?;
        
        // Clean up
        let _ = std::fs::remove_file(temp_path);
        
        Ok(output.status.success())
    }
} 