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
  ],
})
export class NginxConfigModule {}
