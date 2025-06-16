import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Location } from '../entities';
import { CreateLocationDto, UpdateLocationDto } from '../dto';

@Injectable()
export class LocationService {
  constructor(
    @InjectRepository(Location)
    private readonly locationRepository: Repository<Location>,
  ) {}

  async create(createLocationDto: CreateLocationDto): Promise<Location> {
    // Convert string IDs to numbers for entity creation
    const entityData = {
      ...createLocationDto,
      serverId: parseInt(createLocationDto.serverId, 10),
      upstreamId: parseInt(createLocationDto.upstreamId, 10),
    };

    const location = this.locationRepository.create(entityData);
    return await this.locationRepository.save(location);
  }

  async findAll(): Promise<Location[]> {
    return await this.locationRepository.find({
      relations: ['httpServer', 'upstream'],
    });
  }

  async findOne(id: string | number): Promise<Location> {
    const location = await this.locationRepository.findOne({
      where: { id: typeof id === 'string' ? parseInt(id, 10) : id },
      relations: ['httpServer', 'upstream'],
    });

    if (!location) {
      throw new NotFoundException(`Location with ID ${id} not found`);
    }

    return location;
  }

  async update(
    id: string | number,
    updateLocationDto: UpdateLocationDto,
  ): Promise<Location> {
    const location = await this.findOne(id);

    // Convert string IDs to numbers for entity update
    const entityData = {
      ...updateLocationDto,
      serverId: updateLocationDto.serverId
        ? parseInt(updateLocationDto.serverId, 10)
        : undefined,
      upstreamId: updateLocationDto.upstreamId
        ? parseInt(updateLocationDto.upstreamId, 10)
        : undefined,
    };

    Object.assign(location, entityData);
    return await this.locationRepository.save(location);
  }

  async remove(id: string | number): Promise<void> {
    const location = await this.findOne(id);
    await this.locationRepository.remove(location);
  }
}
