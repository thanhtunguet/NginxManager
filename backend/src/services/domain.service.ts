import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Domain } from '../entities';
import { CreateDomainDto, UpdateDomainDto } from '../dto';

@Injectable()
export class DomainService {
  constructor(
    @InjectRepository(Domain)
    private readonly domainRepository: Repository<Domain>,
  ) {}

  async create(createDomainDto: CreateDomainDto): Promise<Domain> {
    const domain = this.domainRepository.create(createDomainDto);
    return await this.domainRepository.save(domain);
  }

  async findAll(): Promise<Domain[]> {
    return await this.domainRepository.find({
      relations: ['certificateMappings', 'serverMappings'],
    });
  }

  async findOne(id: number): Promise<Domain> {
    const domain = await this.domainRepository.findOne({
      where: { id },
      relations: ['certificateMappings', 'serverMappings'],
    });

    if (!domain) {
      throw new NotFoundException(`Domain with ID ${id} not found`);
    }

    return domain;
  }

  async update(id: number, updateDomainDto: UpdateDomainDto): Promise<Domain> {
    const domain = await this.findOne(id);
    Object.assign(domain, updateDomainDto);
    return await this.domainRepository.save(domain);
  }

  async remove(id: number): Promise<void> {
    const domain = await this.findOne(id);
    await this.domainRepository.remove(domain);
  }
}
