import { registerAs } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import {
  AccessRule,
  Certificate,
  CertificateDomainMapping,
  ConfigVersion,
  Domain,
  HttpServer,
  ListeningPort,
  Location,
  NginxSettings,
  ServerDomainMapping,
  Upstream,
} from '../entities';

export const databaseConfig = registerAs(
  'database',
  (): TypeOrmModuleOptions => ({
    type: 'mysql',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    username: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_DATABASE || 'nginx_manager',
    entities: [
      Upstream,
      Domain,
      Certificate,
      CertificateDomainMapping,
      ListeningPort,
      HttpServer,
      ServerDomainMapping,
      Location,
      ConfigVersion,
      AccessRule,
      NginxSettings,
    ],
    synchronize: true,
    dropSchema: false, // Changed from true to false to preserve data
    logging: process.env.NODE_ENV === 'development',
    autoLoadEntities: true,
  }),
);
