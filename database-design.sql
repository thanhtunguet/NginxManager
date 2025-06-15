CREATE TABLE `Upstream`(
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(255) NOT NULL,
    `server` VARCHAR(255) NOT NULL,
    `keepAlive` BIGINT NOT NULL,
    `status` ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
    `healthCheckPath` VARCHAR(255) NOT NULL,
    `healthCheckInterval` BIGINT NOT NULL DEFAULT '50',
    `maxFails` BIGINT NOT NULL DEFAULT '3'
);
CREATE TABLE `Domain`(
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `domain` VARCHAR(255) NOT NULL
);
CREATE TABLE `Certificate`(
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(255) NOT NULL,
    `certificate` MEDIUMTEXT NOT NULL,
    `privateKey` MEDIUMTEXT NOT NULL,
    `expiredAt` DATETIME NOT NULL,
    `issuer` VARCHAR(255) NOT NULL,
    `autoRenew` BOOLEAN NOT NULL DEFAULT '0'
);
CREATE TABLE `CertificateDomainMapping`(
    `certificateId` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `domainId` BIGINT NOT NULL,
    PRIMARY KEY(`domainId`)
);
CREATE TABLE `HttpServer`(
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `listeningPortId` BIGINT NOT NULL,
    `name` BIGINT NOT NULL,
    `additionalConfig` MEDIUMTEXT NOT NULL,
    `status` ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
    `accessLogPath` VARCHAR(255) NOT NULL DEFAULT '/dev/null',
    `errorLogPath` VARCHAR(255) NOT NULL DEFAULT '/dev/null',
    `logLevel` VARCHAR(255) NOT NULL DEFAULT 'warn'
);
CREATE TABLE `ServerDomainMapping`(
    `serverId` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `domainId` BIGINT NOT NULL
);
CREATE TABLE `Location`(
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `serverId` BIGINT NOT NULL,
    `upstreamId` BIGINT NOT NULL,
    `additionalConfig` BIGINT NOT NULL,
    `clientMaxBodySize` VARCHAR(10) NOT NULL
);
CREATE TABLE `ListeningPort`(
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(255) NOT NULL,
    `port` BIGINT NOT NULL
);
CREATE TABLE `ConfigVersion`(
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `serverId` BIGINT NOT NULL,
    `config` MEDIUMTEXT NOT NULL,
    `createdAt` DATETIME NOT NULL,
    `isActive` BOOLEAN NOT NULL
);
ALTER TABLE
    `Domain` ADD CONSTRAINT `domain_id_foreign` FOREIGN KEY(`id`) REFERENCES `CertificateDomainMapping`(`domainId`);
ALTER TABLE
    `Location` ADD CONSTRAINT `location_upstreamid_foreign` FOREIGN KEY(`upstreamId`) REFERENCES `Upstream`(`id`);
ALTER TABLE
    `ServerDomainMapping` ADD CONSTRAINT `serverdomainmapping_domainid_foreign` FOREIGN KEY(`domainId`) REFERENCES `Domain`(`id`);
ALTER TABLE
    `HttpServer` ADD CONSTRAINT `httpserver_listeningportid_foreign` FOREIGN KEY(`listeningPortId`) REFERENCES `ListeningPort`(`id`);
ALTER TABLE
    `ConfigVersion` ADD CONSTRAINT `configversion_serverid_foreign` FOREIGN KEY(`serverId`) REFERENCES `HttpServer`(`id`);
ALTER TABLE
    `Location` ADD CONSTRAINT `location_serverid_foreign` FOREIGN KEY(`serverId`) REFERENCES `HttpServer`(`id`);
ALTER TABLE
    `Certificate` ADD CONSTRAINT `certificate_id_foreign` FOREIGN KEY(`id`) REFERENCES `CertificateDomainMapping`(`certificateId`);
ALTER TABLE
    `HttpServer` ADD CONSTRAINT `httpserver_id_foreign` FOREIGN KEY(`id`) REFERENCES `ServerDomainMapping`(`serverId`);