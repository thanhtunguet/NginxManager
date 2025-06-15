import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ListeningPort } from '../entities/listening-port.entity';

@Injectable()
export class ListeningPortSeeder {
  constructor(
    @InjectRepository(ListeningPort)
    private readonly listeningPortRepository: Repository<ListeningPort>,
  ) {}

  async seed(): Promise<void> {
    // Check if listening ports already exist
    const existingPorts = await this.listeningPortRepository.count();
    if (existingPorts > 0) {
      console.log('Listening ports already exist, skipping seed...');
      return;
    }

    const seedData = [
      {
        name: 'HTTP Default',
        port: 80,
        protocol: 'http',
        ssl: false,
        http2: false,
      },
      {
        name: 'HTTPS Default',
        port: 443,
        protocol: 'https',
        ssl: true,
        http2: true,
      },
      {
        name: 'HTTP Development',
        port: 8080,
        protocol: 'http',
        ssl: false,
        http2: false,
      },
      {
        name: 'HTTPS Development',
        port: 8443,
        protocol: 'https',
        ssl: true,
        http2: true,
      },
      {
        name: 'HTTP Alternative',
        port: 3000,
        protocol: 'http',
        ssl: false,
        http2: false,
      },
      {
        name: 'HTTPS Alternative',
        port: 3443,
        protocol: 'https',
        ssl: true,
        http2: false,
      },
      {
        name: 'HTTP Staging',
        port: 9080,
        protocol: 'http',
        ssl: false,
        http2: false,
      },
      {
        name: 'HTTPS Staging',
        port: 9443,
        protocol: 'https',
        ssl: true,
        http2: true,
      },
    ];

    console.log('Seeding listening ports...');
    
    for (const portData of seedData) {
      const listeningPort = this.listeningPortRepository.create(portData);
      await this.listeningPortRepository.save(listeningPort);
      console.log(`Created listening port: ${portData.name} (${portData.port})`);
    }

    console.log('Listening ports seeding completed!');
  }
}