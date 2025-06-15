import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HttpServer } from '../entities';
import { CreateHttpServerDto, UpdateHttpServerDto } from '../dto';

@Injectable()
export class HttpServerService {
  constructor(
    @InjectRepository(HttpServer)
    private readonly httpServerRepository: Repository<HttpServer>,
  ) {}

  async create(createHttpServerDto: CreateHttpServerDto): Promise<HttpServer> {
    const httpServer = this.httpServerRepository.create(createHttpServerDto);
    return await this.httpServerRepository.save(httpServer);
  }

  async findAll(): Promise<HttpServer[]> {
    return await this.httpServerRepository.find({
      relations: ['listeningPort', 'locations', 'configVersions', 'domainMappings'],
    });
  }

  async findOne(id: number): Promise<HttpServer> {
    const httpServer = await this.httpServerRepository.findOne({
      where: { id },
      relations: ['listeningPort', 'locations', 'configVersions', 'domainMappings'],
    });
    
    if (!httpServer) {
      throw new NotFoundException(`HTTP Server with ID ${id} not found`);
    }
    
    return httpServer;
  }

  async update(id: number, updateHttpServerDto: UpdateHttpServerDto): Promise<HttpServer> {
    const httpServer = await this.findOne(id);
    Object.assign(httpServer, updateHttpServerDto);
    return await this.httpServerRepository.save(httpServer);
  }

  async remove(id: number): Promise<void> {
    const httpServer = await this.findOne(id);
    await this.httpServerRepository.remove(httpServer);
  }
}