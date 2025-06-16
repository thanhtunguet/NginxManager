import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as fs from 'fs';
import * as Handlebars from 'handlebars';
import * as path from 'path';
import { Repository } from 'typeorm';
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
    // Re-register partials to pick up any template changes
    Handlebars.unregisterPartial('server');
    this.registerPartial('server', 'server.hbs');
    this.compileTemplate('main', 'main.hbs');

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
        'certificate',
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

    const rawConfig = mainTemplate(templateData);
    return this.formatNginxConfig(rawConfig);
  }

  private async processServerData(server: HttpServer): Promise<any> {
    const accessRules = await this.accessRuleRepository.find({
      where: { serverId: server.id, scope: AccessRuleScope.SERVER },
    });

    // Use server name as fallback when no domain mappings exist
    const serverNames =
      server.domainMappings.length > 0
        ? server.domainMappings
            .map((mapping) => mapping.domain.domain)
            .join(' ')
        : server.name;

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
    // Use directly assigned certificate for the server
    let certificateName = server.name; // fallback

    if (server.certificate) {
      certificateName = server.certificate.name;
    } else if (server.domainMappings.length > 0) {
      // Fallback: Find certificates for the domains of this server
      const domainIds = server.domainMappings.map(
        (mapping) => mapping.domain.id,
      );

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
        'certificate',
      ],
    });

    if (!server) {
      throw new Error(`Server with ID ${serverId} not found or inactive`);
    }

    const processedServer = await this.processServerData(server);
    const templatePath = path.join(this.templatesPath, 'server.hbs');
    const templateSource = fs.readFileSync(templatePath, 'utf8');
    const serverTemplate = Handlebars.compile(templateSource);

    const rawConfig = serverTemplate(processedServer);
    return this.formatNginxConfig(rawConfig);
  }

  private formatNginxConfig(config: string): string {
    const lines = config.split('\n');
    const formatted: string[] = [];
    let indentLevel = 0;
    const indentSize = 4; // 4 spaces per indent level
    let lastLineWasEmpty = false;

    for (let i = 0; i < lines.length; i++) {
      let line = lines[i].trim();

      // Skip empty lines in raw output, but track them
      if (line === '') {
        continue;
      }

      // Handle closing braces - decrease indent before adding the line
      if (line === '}') {
        indentLevel = Math.max(0, indentLevel - 1);
      }

      // Add proper indentation
      const indent = ' '.repeat(indentLevel * indentSize);
      formatted.push(indent + line);

      // Handle opening braces and blocks - increase indent after adding the line
      if (line.endsWith('{')) {
        indentLevel++;
      }

      // Add spacing around major blocks for readability
      const shouldAddSpacing =
        line.startsWith('upstream ') ||
        line.startsWith('server {') ||
        (line === '}' && indentLevel === 0);

      if (shouldAddSpacing && !lastLineWasEmpty) {
        formatted.push('');
        lastLineWasEmpty = true;
      } else {
        lastLineWasEmpty = false;
      }
    }

    // Remove any trailing empty lines and ensure file ends with single newline
    while (formatted.length > 0 && formatted[formatted.length - 1] === '') {
      formatted.pop();
    }

    // Join with newlines and ensure proper line ending
    return formatted.join('\n') + '\n';
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

  async saveConfigVersion(
    config: string,
    serverId?: number,
    name?: string,
  ): Promise<any> {
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
      name: name || `Configuration ${new Date().toLocaleString()}`,
      createdAt: new Date(),
      isActive: true,
    });

    return await this.configVersionRepository.save(configVersion);
  }

  async updateConfigVersionName(id: number, name: string): Promise<any> {
    const configVersion = await this.configVersionRepository.findOne({
      where: { id },
    });

    if (!configVersion) {
      throw new Error('Config version not found');
    }

    configVersion.name = name;
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
