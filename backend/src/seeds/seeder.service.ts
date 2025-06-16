import { Injectable } from '@nestjs/common';
import { ListeningPortSeeder } from './listening-port.seed';

@Injectable()
export class SeederService {
  constructor(private readonly listeningPortSeeder: ListeningPortSeeder) {}

  async seedAll(): Promise<void> {
    console.log('Starting database seeding...');

    try {
      // Seed listening ports first as they are referenced by other entities
      await this.listeningPortSeeder.seed();

      console.log('Database seeding completed successfully!');
    } catch (error) {
      console.error('Error during seeding:', error);
      throw error;
    }
  }
}
