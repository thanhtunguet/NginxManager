import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ListeningPort } from '../entities';
import { CreateListeningPortDto, UpdateListeningPortDto } from '../dto';

@Injectable()
export class ListeningPortService {
  constructor(
    @InjectRepository(ListeningPort)
    private readonly listeningPortRepository: Repository<ListeningPort>,
  ) {}

  async create(
    createListeningPortDto: CreateListeningPortDto,
  ): Promise<ListeningPort> {
    const listeningPort = this.listeningPortRepository.create(
      createListeningPortDto,
    );
    return await this.listeningPortRepository.save(listeningPort);
  }

  async findAll(): Promise<ListeningPort[]> {
    return await this.listeningPortRepository.find({
      relations: ['httpServers'],
    });
  }

  async findOne(id: number): Promise<ListeningPort> {
    const listeningPort = await this.listeningPortRepository.findOne({
      where: { id },
      relations: ['httpServers'],
    });

    if (!listeningPort) {
      throw new NotFoundException(`Listening Port with ID ${id} not found`);
    }

    return listeningPort;
  }

  async update(
    id: number,
    updateListeningPortDto: UpdateListeningPortDto,
  ): Promise<ListeningPort> {
    const listeningPort = await this.findOne(id);
    Object.assign(listeningPort, updateListeningPortDto);
    return await this.listeningPortRepository.save(listeningPort);
  }

  async remove(id: number): Promise<void> {
    const listeningPort = await this.findOne(id);
    await this.listeningPortRepository.remove(listeningPort);
  }
}
