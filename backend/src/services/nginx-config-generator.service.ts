import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  HttpServer,
  HttpServerStatus,
  Upstream,
  UpstreamStatus,
  Location,
  Domain,
  Certificate,
  ListeningPort,
  AccessRule,
  AccessRuleScope,
  AccessRuleType,
  ConfigVersion,
} from '../entities';

@Injectable()
export class NginxConfigGeneratorService {
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
  ) {}

  async generateFullConfig(): Promise<string> {
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

    let config = this.generateMainConfig();
    config += this.generateUpstreamBlocks(upstreams);
    
    for (const server of servers) {
      config += await this.generateServerBlock(server);
    }

    return config;
  }

  private generateMainConfig(): string {
    return `
events {
    worker_connections 1024;
}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;
    
    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';
    
    sendfile        on;
    tcp_nopush      on;
    tcp_nodelay     on;
    keepalive_timeout  65;
    types_hash_max_size 2048;
    
    gzip on;
    gzip_vary on;
    gzip_min_length 10240;
    gzip_proxied expired no-cache no-store private must-revalidate auth;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/x-javascript
        application/xml+rss
        application/javascript
        application/json;

`;
  }

  private generateUpstreamBlocks(upstreams: Upstream[]): string {
    let config = '';
    
    for (const upstream of upstreams) {
      config += `
    upstream ${upstream.name} {
        server ${upstream.server};
        keepalive ${upstream.keepAlive};
    }
`;
    }
    
    return config;
  }

  private async generateServerBlock(server: HttpServer): Promise<string> {
    const accessRules = await this.accessRuleRepository.find({
      where: { serverId: server.id, scope: AccessRuleScope.SERVER },
    });

    const serverNames = server.domainMappings
      .map(mapping => mapping.domain.domain)
      .join(' ');

    let config = `
    server {
        listen ${server.listeningPort.port}${server.listeningPort.ssl ? ' ssl' : ''}${server.listeningPort.http2 ? ' http2' : ''};
        server_name ${serverNames || '_'};
        
        access_log ${server.accessLogPath};
        error_log ${server.errorLogPath} ${server.logLevel};
`;

    // Add SSL configuration if enabled
    if (server.listeningPort.ssl) {
      config += await this.generateSSLConfig(server);
    }

    // Add access rules
    config += this.generateAccessRules(accessRules);

    // Add locations
    for (const location of server.locations) {
      config += await this.generateLocationBlock(location);
    }

    // Add additional config
    if (server.additionalConfig) {
      config += `
        ${server.additionalConfig}
`;
    }

    config += `    }
`;

    return config;
  }

  private async generateSSLConfig(server: HttpServer): Promise<string> {
    let config = '';
    
    // Find certificates for the domains of this server
    const domainIds = server.domainMappings.map(mapping => mapping.domain.id);
    
    if (domainIds.length > 0) {
      // Get certificate mappings for the domains
      const certificateMappings = await this.certificateRepository
        .createQueryBuilder('certificate')
        .innerJoin('certificate.domainMappings', 'cdm')
        .where('cdm.domainId IN (:...domainIds)', { domainIds })
        .getMany();

      if (certificateMappings.length > 0) {
        const certificate = certificateMappings[0]; // Use first certificate found
        config += `
        ssl_certificate /etc/nginx/ssl/${certificate.name}.crt;
        ssl_certificate_key /etc/nginx/ssl/${certificate.name}.key;`;
      } else {
        // Fallback to server name
        config += `
        ssl_certificate /etc/nginx/ssl/${server.name}.crt;
        ssl_certificate_key /etc/nginx/ssl/${server.name}.key;`;
      }
    } else {
      // Fallback to server name
      config += `
        ssl_certificate /etc/nginx/ssl/${server.name}.crt;
        ssl_certificate_key /etc/nginx/ssl/${server.name}.key;`;
    }

    config += `
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-SHA384:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-SHA:ECDHE-RSA-AES128-SHA:AES256-GCM-SHA384:AES128-GCM-SHA256:AES256-SHA256:AES128-SHA256:AES256-SHA:AES128-SHA:!DSS;
        ssl_prefer_server_ciphers off;
        ssl_session_timeout 1d;
        ssl_session_cache shared:SSL:50m;
        ssl_stapling on;
        ssl_stapling_verify on;
        add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
        add_header X-Frame-Options DENY;
        add_header X-Content-Type-Options nosniff;
        add_header X-XSS-Protection "1; mode=block";
`;

    return config;
  }

  private generateAccessRules(accessRules: AccessRule[]): string {
    let config = '';
    
    for (const rule of accessRules) {
      config += `        ${rule.rule} ${rule.ipAddress};\n`;
    }
    
    if (accessRules.length > 0) {
      config += `        deny all;\n`;
    }
    
    return config;
  }

  private async generateLocationBlock(location: Location): Promise<string> {
    const locationAccessRules = await this.accessRuleRepository.find({
      where: { locationId: location.id, scope: AccessRuleScope.LOCATION },
    });

    let config = `
        location ${location.path} {
            proxy_pass http://${location.upstream.name};
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            
            client_max_body_size ${location.clientMaxBodySize};
`;

    // Add location-specific access rules
    config += this.generateAccessRules(locationAccessRules);

    // Add additional location config
    if (location.additionalConfig) {
      config += `            ${location.additionalConfig}\n`;
    }

    config += `        }
`;

    return config;
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

    return await this.generateServerBlock(server);
  }

  async validateConfig(config: string): Promise<{ valid: boolean; errors?: string[] }> {
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
        { isActive: false }
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