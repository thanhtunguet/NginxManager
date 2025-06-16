import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as Handlebars from 'handlebars';
import * as fs from 'fs';
import * as path from 'path';
import {
  AccessRule,
  AccessRuleScope,
  Certificate,
  ConfigVersion,
  Domain,
  HttpServer,
  HttpServerStatus,
  ListeningPort,
  Location,
  Upstream,
  UpstreamStatus,
} from '../entities';

@Injectable()
export class NginxConfigGeneratorService {
  private templates: Map<string, HandlebarsTemplateDelegate> = new Map();
  private readonly templatesPath = path.join(
    __dirname,
    '..',
    '..',
    'src',
    'templates',
  );

  constructor(
    @InjectRepository(HttpServer)
    private readonly httpServerRepository: Repository<HttpServer>,
    @InjectRepository(Upstream)
    private readonly upstreamRepository: Repository<Upstream>,
    @InjectRepository(Location)
    private readonly locationRepository: Repository<Location>,
    @InjectRepository(Domain)
    private readonly domainRepository: Repository<Domain>,
    @InjectRepository(Certificate)
    private readonly certificateRepository: Repository<Certificate>,
    @InjectRepository(ListeningPort)
    private readonly listeningPortRepository: Repository<ListeningPort>,
    @InjectRepository(AccessRule)
    private readonly accessRuleRepository: Repository<AccessRule>,
    @InjectRepository(ConfigVersion)
    private readonly configVersionRepository: Repository<ConfigVersion>,
  ) {
    this.initializeTemplates();
  }

  private initializeTemplates(): void {
    // Register partials
    this.registerPartial('upstream', 'upstream.hbs');
    this.registerPartial('server', 'server.hbs');
    this.registerPartial('location', 'location.hbs');
    this.registerPartial('ssl-config', 'ssl-config.hbs');

    // Compile main template
    this.compileTemplate('main', 'main.hbs');
  }

  private registerPartial(name: string, filename: string): void {
    const templatePath = path.join(this.templatesPath, filename);
    if (fs.existsSync(templatePath)) {
      const templateSource = fs.readFileSync(templatePath, 'utf8');
      Handlebars.registerPartial(name, templateSource);
    }
  }

  private compileTemplate(name: string, filename: string): void {
    const templatePath = path.join(this.templatesPath, filename);
    if (fs.existsSync(templatePath)) {
      const templateSource = fs.readFileSync(templatePath, 'utf8');
      this.templates.set(name, Handlebars.compile(templateSource));
    }
  }

  async generateFullConfig(): Promise<string> {
    return await this.generateServerBlocksOnly();
  }

  async generateServerBlocksOnly(): Promise<string> {
    const upstreams = await this.upstreamRepository.find({
      where: { status: UpstreamStatus.ACTIVE },
    });
    const servers = await this.httpServerRepository.find({
      where: { status: HttpServerStatus.ACTIVE },
      relations: [
        'listeningPort',
        'locations',
        'locations.upstream',
        'domainMappings',
        'domainMappings.domain',
      ],
    });

    const processedServers = await Promise.all(
      servers.map((server) => this.processServerData(server)),
    );

    const templateData = {
      upstreams: upstreams.length > 0 ? upstreams : null,
      servers: processedServers,
    };

    const mainTemplate = this.templates.get('main');
    if (!mainTemplate) {
      throw new Error('Main template not found');
    }

    return mainTemplate(templateData);
  }

  private async processServerData(server: HttpServer): Promise<any> {
    const accessRules = await this.accessRuleRepository.find({
      where: { serverId: server.id, scope: AccessRuleScope.SERVER },
    });

    const serverNames = server.domainMappings
      .map((mapping) => mapping.domain.domain)
      .join(' ');

    const processedLocations = await Promise.all(
      server.locations.map((location) => this.processLocationData(location)),
    );

    let sslConfig: string | null = null;
    if (server.listeningPort.ssl) {
      sslConfig = await this.generateSSLConfigData(server);
    }

    return {
      ...server,
      serverNames,
      accessRules,
      locations: processedLocations,
      sslConfig,
    };
  }

  private async processLocationData(location: Location): Promise<any> {
    const accessRules = await this.accessRuleRepository.find({
      where: { locationId: location.id, scope: AccessRuleScope.LOCATION },
    });

    return {
      ...location,
      accessRules,
    };
  }

  private async generateSSLConfigData(server: HttpServer): Promise<string> {
    // Find certificates for the domains of this server
    const domainIds = server.domainMappings.map((mapping) => mapping.domain.id);
    let certificateName = server.name; // fallback

    if (domainIds.length > 0) {
      // Get certificate mappings for the domains
      const certificateMappings = await this.certificateRepository
        .createQueryBuilder('certificate')
        .innerJoin('certificate.domainMappings', 'cdm')
        .where('cdm.domainId IN (:...domainIds)', { domainIds })
        .getMany();

      if (certificateMappings.length > 0) {
        certificateName = certificateMappings[0].name; // Use first certificate found
      }
    }

    const templatePath = path.join(this.templatesPath, 'ssl-config.hbs');
    const templateSource = fs.readFileSync(templatePath, 'utf8');
    const sslTemplate = Handlebars.compile(templateSource);

    return sslTemplate({ certificateName });
  }

  async generateServerConfig(serverId: number): Promise<string> {
    const server = await this.httpServerRepository.findOne({
      where: { id: serverId, status: HttpServerStatus.ACTIVE },
      relations: [
        'listeningPort',
        'locations',
        'locations.upstream',
        'domainMappings',
        'domainMappings.domain',
      ],
    });

    if (!server) {
      throw new Error(`Server with ID ${serverId} not found or inactive`);
    }

    const processedServer = await this.processServerData(server);
    const templatePath = path.join(this.templatesPath, 'server.hbs');
    const templateSource = fs.readFileSync(templatePath, 'utf8');
    const serverTemplate = Handlebars.compile(templateSource);

    return serverTemplate(processedServer);
  }

  validateConfig(config: string): { valid: boolean; errors?: string[] } {
    // This would implement nginx -t equivalent validation
    // For now, return a basic validation
    const errors: string[] = [];

    if (!config.includes('server {')) {
      errors.push('Configuration must contain at least one server block');
    }

    if (!config.includes('listen ')) {
      errors.push('Server blocks must contain listen directive');
    }

    // Check for balanced braces
    const openBraces = (config.match(/{/g) || []).length;
    const closeBraces = (config.match(/}/g) || []).length;
    if (openBraces !== closeBraces) {
      errors.push('Unbalanced braces in configuration');
    }

    // Check for required directives
    if (config.includes('ssl') && !config.includes('ssl_certificate')) {
      errors.push('SSL enabled but no ssl_certificate directive found');
    }

    return {
      valid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined,
    };
  }

  async saveConfigVersion(config: string, serverId?: number): Promise<any> {
    // Deactivate previous active versions for this server
    if (serverId) {
      await this.configVersionRepository.update(
        { serverId, isActive: true },
        { isActive: false },
      );
    }

    const configVersion = this.configVersionRepository.create({
      config,
      serverId,
      createdAt: new Date(),
      isActive: true,
    });

    return await this.configVersionRepository.save(configVersion);
  }

  async getConfigVersions(serverId?: number): Promise<any[]> {
    return await this.configVersionRepository.find({
      where: serverId ? { serverId } : {},
      order: { createdAt: 'DESC' },
      take: 10,
    });
  }

  async getActiveConfigVersion(serverId?: number): Promise<any> {
    return await this.configVersionRepository.findOne({
      where: serverId ? { serverId, isActive: true } : { isActive: true },
      order: { createdAt: 'DESC' },
    });
  }
}
