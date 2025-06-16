import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Upstream } from '../entities';
import { CreateUpstreamDto, UpdateUpstreamDto } from '../dto';

@Injectable()
export class UpstreamService {
  constructor(
    @InjectRepository(Upstream)
    private readonly upstreamRepository: Repository<Upstream>,
  ) {}

  async create(createUpstreamDto: CreateUpstreamDto): Promise<Upstream> {
    const upstream = this.upstreamRepository.create(createUpstreamDto);
    return await this.upstreamRepository.save(upstream);
  }

  async findAll(): Promise<Upstream[]> {
    return await this.upstreamRepository.find({
      relations: ['locations'],
    });
  }

  async findOne(id: number): Promise<Upstream> {
    const upstream = await this.upstreamRepository.findOne({
      where: { id },
      relations: ['locations'],
    });

    if (!upstream) {
      throw new NotFoundException(`Upstream with ID ${id} not found`);
    }

    return upstream;
  }

  async update(
    id: number,
    updateUpstreamDto: UpdateUpstreamDto,
  ): Promise<Upstream> {
    const upstream = await this.findOne(id);
    Object.assign(upstream, updateUpstreamDto);
    return await this.upstreamRepository.save(upstream);
  }

  async remove(id: number): Promise<void> {
    const upstream = await this.findOne(id);
    await this.upstreamRepository.remove(upstream);
  }
}
