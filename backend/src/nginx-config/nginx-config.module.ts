import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
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
} from '../entities';
import {
  UpstreamService,
  DomainService,
  CertificateService,
  ListeningPortService,
  HttpServerService,
  LocationService,
  AccessRuleService,
  NginxConfigGeneratorService,
  NginxSettingsService,
} from '../services';
import {
  UpstreamController,
  DomainController,
  CertificateController,
  HttpServerController,
  ListeningPortController,
  LocationController,
  AccessRuleController,
  NginxConfigController,
  NginxSettingsController,
} from '../controllers';

@Module({
  imports: [
    TypeOrmModule.forFeature([
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
    ]),
  ],
  controllers: [
    UpstreamController,
    DomainController,
    CertificateController,
    HttpServerController,
    ListeningPortController,
    LocationController,
    AccessRuleController,
    NginxConfigController,
    NginxSettingsController,
  ],
  providers: [
    UpstreamService,
    DomainService,
    CertificateService,
    ListeningPortService,
    HttpServerService,
    LocationService,
    AccessRuleService,
    NginxConfigGeneratorService,
    NginxSettingsService,
  ],
  exports: [
    UpstreamService,
    DomainService,
    CertificateService,
    ListeningPortService,
    HttpServerService,
    LocationService,
    AccessRuleService,
    NginxConfigGeneratorService,
    NginxSettingsService,
  ],
})
export class NginxConfigModule {}
