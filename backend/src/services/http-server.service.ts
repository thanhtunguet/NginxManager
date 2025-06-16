import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HttpServer, Location } from '../entities';
import { CreateHttpServerDto, UpdateHttpServerDto } from '../dto';

@Injectable()
export class HttpServerService {
  constructor(
    @InjectRepository(HttpServer)
    private readonly httpServerRepository: Repository<HttpServer>,
    @InjectRepository(Location)
    private readonly locationRepository: Repository<Location>,
  ) {}

  async create(createHttpServerDto: CreateHttpServerDto): Promise<HttpServer> {
    const { locations, ...serverData } = createHttpServerDto;
    
    // Create the server first
    const httpServer = this.httpServerRepository.create(serverData);
    const savedServer = await this.httpServerRepository.save(httpServer);
    
    // Create locations if provided
    if (locations && locations.length > 0) {
      const locationEntities = locations.map(locationData => 
        this.locationRepository.create({
          ...locationData,
          serverId: savedServer.id,
        })
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
      relations: ['listeningPort', 'locations', 'configVersions', 'domainMappings', 'certificate'],
    });
  }

  async findOne(id: number): Promise<HttpServer> {
    const httpServer = await this.httpServerRepository.findOne({
      where: { id },
      relations: ['listeningPort', 'locations', 'configVersions', 'domainMappings', 'certificate'],
    });
    
    if (!httpServer) {
      throw new NotFoundException(`HTTP Server with ID ${id} not found`);
    }
    
    return httpServer;
  }

  async update(id: number, updateHttpServerDto: UpdateHttpServerDto): Promise<HttpServer> {
    const { locations, ...serverData } = updateHttpServerDto;
    
    // Update the server data
    const httpServer = await this.findOne(id);
    Object.assign(httpServer, serverData);
    const savedServer = await this.httpServerRepository.save(httpServer);
    
    // Update locations if provided
    if (locations !== undefined) {
      // Remove existing locations
      await this.locationRepository.delete({ serverId: id });
      
      // Create new locations
      if (locations.length > 0) {
        const locationEntities = locations.map(locationData => 
          this.locationRepository.create({
            ...locationData,
            serverId: savedServer.id,
          })
        );
        await this.locationRepository.save(locationEntities);
      }
    }
    
    // Return updated server with locations
    return await this.findOne(savedServer.id);
  }

  async remove(id: number): Promise<void> {
    const httpServer = await this.findOne(id);
    await this.httpServerRepository.remove(httpServer);
  }
}