import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AccessRule } from '../entities';
import { CreateAccessRuleDto, UpdateAccessRuleDto } from '../dto';

@Injectable()
export class AccessRuleService {
  constructor(
    @InjectRepository(AccessRule)
    private readonly accessRuleRepository: Repository<AccessRule>,
  ) {}

  async create(createAccessRuleDto: CreateAccessRuleDto): Promise<AccessRule> {
    const accessRule = this.accessRuleRepository.create(createAccessRuleDto);
    return await this.accessRuleRepository.save(accessRule);
  }

  async findAll(): Promise<AccessRule[]> {
    return await this.accessRuleRepository.find({
      relations: ['httpServer', 'location'],
    });
  }

  async findOne(id: number): Promise<AccessRule> {
    const accessRule = await this.accessRuleRepository.findOne({
      where: { id },
      relations: ['httpServer', 'location'],
    });

    if (!accessRule) {
      throw new NotFoundException(`Access Rule with ID ${id} not found`);
    }

    return accessRule;
  }

  async update(
    id: number,
    updateAccessRuleDto: UpdateAccessRuleDto,
  ): Promise<AccessRule> {
    const accessRule = await this.findOne(id);
    Object.assign(accessRule, updateAccessRuleDto);
    return await this.accessRuleRepository.save(accessRule);
  }

  async remove(id: number): Promise<void> {
    const accessRule = await this.findOne(id);
    await this.accessRuleRepository.remove(accessRule);
  }
}
