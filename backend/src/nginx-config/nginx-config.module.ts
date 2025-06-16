import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
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
import {
  AccessRuleService,
  CertificateService,
  DomainService,
  HttpServerService,
  ListeningPortService,
  LocationService,
  NginxConfigGeneratorService,
  NginxSettingsService,
  UpstreamService,
} from '../services';
import {
  AccessRuleController,
  CertificateController,
  DomainController,
  HttpServerController,
  ListeningPortController,
  LocationController,
  NginxConfigController,
  NginxSettingsController,
  UpstreamController,
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
