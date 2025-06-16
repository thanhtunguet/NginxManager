import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HttpServer, Location, ListeningPort } from '../entities';
import { CreateHttpServerDto, UpdateHttpServerDto } from '../dto';

@Injectable()
export class HttpServerService {
  constructor(
    @InjectRepository(HttpServer)
    private readonly httpServerRepository: Repository<HttpServer>,
    @InjectRepository(Location)
    private readonly locationRepository: Repository<Location>,
    @InjectRepository(ListeningPort)
    private readonly listeningPortRepository: Repository<ListeningPort>,
  ) {}

  private async validateSSLConfiguration(
    listeningPortId: string,
    certificateId?: string,
  ): Promise<void> {
    const listeningPort = await this.listeningPortRepository.findOne({
      where: { id: parseInt(listeningPortId, 10) },
    });

    if (!listeningPort) {
      throw new NotFoundException(
        `Listening port with ID ${listeningPortId} not found`,
      );
    }

    if (listeningPort.ssl && !certificateId) {
      throw new BadRequestException(
        'SSL certificate is required when using an SSL-enabled listening port',
      );
    }
  }

  async create(createHttpServerDto: CreateHttpServerDto): Promise<HttpServer> {
    const { locations, ...serverData } = createHttpServerDto;

    // Validate SSL configuration
    await this.validateSSLConfiguration(
      serverData.listeningPortId,
      serverData.certificateId,
    );

    // Convert string IDs to numbers for entity creation
    const entityData = {
      ...serverData,
      listeningPortId: parseInt(serverData.listeningPortId, 10),
      certificateId: serverData.certificateId
        ? parseInt(serverData.certificateId, 10)
        : undefined,
    };

    // Create the server first
    const httpServer = this.httpServerRepository.create(entityData);
    const savedServer = await this.httpServerRepository.save(httpServer);

    // Create locations if provided
    if (locations && locations.length > 0) {
      const locationEntities = locations.map((locationData) =>
        this.locationRepository.create({
          ...locationData,
          serverId: savedServer.id,
          upstreamId: parseInt(locationData.upstreamId, 10),
        }),
      );
      await this.locationRepository.save(locationEntities);
    } else {
      // Create default root location if no locations provided
      // Note: You'll need to set upstreamId when you have at least one upstream created
      const defaultLocation = this.locationRepository.create({
        serverId: savedServer.id,
        path: '/',
        upstreamId: 1, // Default upstream - should be configurable
        additionalConfig: '',
        clientMaxBodySize: '1m',
      });
      await this.locationRepository.save(defaultLocation);
    }

    // Return server with locations
    return await this.findOne(savedServer.id);
  }

  async findAll(): Promise<HttpServer[]> {
    return await this.httpServerRepository.find({
      relations: [
        'listeningPort',
        'locations',
        'configVersions',
        'domainMappings',
        'certificate',
      ],
    });
  }

  async findOne(id: string | number): Promise<HttpServer> {
    const httpServer = await this.httpServerRepository.findOne({
      where: { id: typeof id === 'string' ? parseInt(id, 10) : id },
      relations: [
        'listeningPort',
        'locations',
        'configVersions',
        'domainMappings',
        'certificate',
      ],
    });

    if (!httpServer) {
      throw new NotFoundException(`HTTP Server with ID ${id} not found`);
    }

    return httpServer;
  }

  async update(
    id: string | number,
    updateHttpServerDto: UpdateHttpServerDto,
  ): Promise<HttpServer> {
    const { locations, ...serverData } = updateHttpServerDto;

    // Get existing server data
    const httpServer = await this.findOne(id);

    // Determine final listening port and certificate IDs
    const finalListeningPortId =
      serverData.listeningPortId ?? httpServer.listeningPortId.toString();
    const finalCertificateId =
      serverData.certificateId ?? httpServer.certificateId?.toString();

    // Validate SSL configuration with updated values
    await this.validateSSLConfiguration(
      finalListeningPortId,
      finalCertificateId,
    );

    // Convert string IDs to numbers for entity update
    const entityData = {
      ...serverData,
      listeningPortId: serverData.listeningPortId
        ? parseInt(serverData.listeningPortId, 10)
        : undefined,
      certificateId: serverData.certificateId
        ? parseInt(serverData.certificateId, 10)
        : undefined,
    };

    // Update the server data
    Object.assign(httpServer, entityData);
    const savedServer = await this.httpServerRepository.save(httpServer);

    // Update locations if provided
    if (locations !== undefined) {
      // Remove existing locations
      const serverId = typeof id === 'string' ? parseInt(id, 10) : id;
      await this.locationRepository.delete({ serverId });

      // Create new locations
      if (locations.length > 0) {
        const locationEntities = locations.map((locationData) =>
          this.locationRepository.create({
            ...locationData,
            serverId: savedServer.id,
            upstreamId: parseInt(locationData.upstreamId, 10),
          }),
        );
        await this.locationRepository.save(locationEntities);
      }
    }

    // Return updated server with locations
    return await this.findOne(savedServer.id);
  }

  async remove(id: string | number): Promise<void> {
    const httpServer = await this.findOne(id);

    // Delete all associated locations first
    const serverId = typeof id === 'string' ? parseInt(id, 10) : id;
    await this.locationRepository.delete({ serverId });

    // Then delete the server
    await this.httpServerRepository.remove(httpServer);
  }
}
