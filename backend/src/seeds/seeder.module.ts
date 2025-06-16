import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ListeningPort } from '../entities/listening-port.entity';
import { ListeningPortSeeder } from './listening-port.seed';
import { SeederService } from './seeder.service';

@Module({
  imports: [TypeOrmModule.forFeature([ListeningPort])],
  providers: [ListeningPortSeeder, SeederService],
  exports: [SeederService],
})
export class SeederModule {}
