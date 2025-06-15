-- Initial schema for NGINX Manager
-- This migration creates all the tables needed for the NGINX configuration management system

-- Upstream table for load balancing configuration
CREATE TABLE `Upstream` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(255) NOT NULL UNIQUE,
    `server` VARCHAR(255) NOT NULL,
    `keepAlive` BIGINT NOT NULL DEFAULT 32,
    `status` ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
    `healthCheckPath` VARCHAR(255) NOT NULL DEFAULT '/health',
    `healthCheckInterval` BIGINT NOT NULL DEFAULT 50,
    `maxFails` BIGINT NOT NULL DEFAULT 3,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Domain table for domain names
CREATE TABLE `Domain` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `domain` VARCHAR(255) NOT NULL UNIQUE,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Certificate table for SSL/TLS certificates
CREATE TABLE `Certificate` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(255) NOT NULL UNIQUE,
    `certificate` MEDIUMTEXT NOT NULL,
    `privateKey` MEDIUMTEXT NOT NULL,
    `expiredAt` DATETIME NOT NULL,
    `issuer` VARCHAR(255) NOT NULL,
    `autoRenew` BOOLEAN NOT NULL DEFAULT FALSE,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ListeningPort table for port configuration
CREATE TABLE `ListeningPort` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(255) NOT NULL UNIQUE,
    `port` BIGINT NOT NULL UNIQUE,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- HttpServer table for server blocks
CREATE TABLE `HttpServer` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `listeningPortId` BIGINT UNSIGNED NOT NULL,
    `name` VARCHAR(255) NOT NULL UNIQUE,
    `additionalConfig` MEDIUMTEXT NOT NULL DEFAULT '',
    `status` ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
    `accessLogPath` VARCHAR(255) NOT NULL DEFAULT '/dev/null',
    `errorLogPath` VARCHAR(255) NOT NULL DEFAULT '/dev/null',
    `logLevel` VARCHAR(255) NOT NULL DEFAULT 'warn',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`listeningPortId`) REFERENCES `ListeningPort`(`id`) ON DELETE CASCADE
);

-- Location table for location blocks
CREATE TABLE `Location` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `serverId` BIGINT UNSIGNED NOT NULL,
    `upstreamId` BIGINT UNSIGNED NOT NULL,
    `path` VARCHAR(255) NOT NULL DEFAULT '/',
    `additionalConfig` MEDIUMTEXT NOT NULL DEFAULT '',
    `clientMaxBodySize` VARCHAR(10) NOT NULL DEFAULT '1m',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`serverId`) REFERENCES `HttpServer`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`upstreamId`) REFERENCES `Upstream`(`id`) ON DELETE CASCADE
);

-- ConfigVersion table for configuration versioning
CREATE TABLE `ConfigVersion` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `serverId` BIGINT UNSIGNED NOT NULL,
    `config` MEDIUMTEXT NOT NULL,
    `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `isActive` BOOLEAN NOT NULL DEFAULT FALSE,
    FOREIGN KEY (`serverId`) REFERENCES `HttpServer`(`id`) ON DELETE CASCADE
);

-- AccessRule table for IP-based access control
CREATE TABLE `AccessRule` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `serverId` BIGINT UNSIGNED NULL,
    `locationId` BIGINT UNSIGNED NULL,
    `ipAddress` VARCHAR(45) NOT NULL, -- IPv6 compatible
    `action` ENUM('allow', 'deny') NOT NULL,
    `description` VARCHAR(255) NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`serverId`) REFERENCES `HttpServer`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`locationId`) REFERENCES `Location`(`id`) ON DELETE CASCADE,
    CHECK (`serverId` IS NOT NULL OR `locationId` IS NOT NULL)
);

-- Junction tables for many-to-many relationships

-- ServerDomainMapping for server-domain relationships
CREATE TABLE `ServerDomainMapping` (
    `serverId` BIGINT UNSIGNED NOT NULL,
    `domainId` BIGINT UNSIGNED NOT NULL,
    PRIMARY KEY (`serverId`, `domainId`),
    FOREIGN KEY (`serverId`) REFERENCES `HttpServer`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`domainId`) REFERENCES `Domain`(`id`) ON DELETE CASCADE
);

-- CertificateDomainMapping for certificate-domain relationships
CREATE TABLE `CertificateDomainMapping` (
    `certificateId` BIGINT UNSIGNED NOT NULL,
    `domainId` BIGINT UNSIGNED NOT NULL,
    PRIMARY KEY (`certificateId`, `domainId`),
    FOREIGN KEY (`certificateId`) REFERENCES `Certificate`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`domainId`) REFERENCES `Domain`(`id`) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX `idx_upstream_name` ON `Upstream`(`name`);
CREATE INDEX `idx_domain_domain` ON `Domain`(`domain`);
CREATE INDEX `idx_certificate_name` ON `Certificate`(`name`);
CREATE INDEX `idx_certificate_expired_at` ON `Certificate`(`expiredAt`);
CREATE INDEX `idx_httpserver_name` ON `HttpServer`(`name`);
CREATE INDEX `idx_httpserver_status` ON `HttpServer`(`status`);
CREATE INDEX `idx_location_server_id` ON `Location`(`serverId`);
CREATE INDEX `idx_location_upstream_id` ON `Location`(`upstreamId`);
CREATE INDEX `idx_configversion_server_id` ON `ConfigVersion`(`serverId`);
CREATE INDEX `idx_configversion_is_active` ON `ConfigVersion`(`isActive`);
CREATE INDEX `idx_accessrule_ip_address` ON `AccessRule`(`ipAddress`);
CREATE INDEX `idx_accessrule_server_id` ON `AccessRule`(`serverId`);
CREATE INDEX `idx_accessrule_location_id` ON `AccessRule`(`locationId`);

-- Insert default listening ports
INSERT INTO `ListeningPort` (`name`, `port`) VALUES 
('HTTP', 80),
('HTTPS', 443),
('HTTP-Alt', 8080),
('HTTPS-Alt', 8443); 