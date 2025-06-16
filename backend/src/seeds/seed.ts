import { NestFactory } from '@nestjs/core';
import { SeederModule } from './seeder.module';
import { SeederService } from './seeder.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { databaseConfig } from '../config/database.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig],
    }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3306', 10),
      username: process.env.DB_USERNAME || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_DATABASE || 'nginx_manager',
      entities: [__dirname + '/../**/*.entity{.ts,.js}'],
      synchronize: false, // Don't sync schema during seeding
      logging: false, // Reduce log noise
    }),
    SeederModule,
  ],
})
class SeedAppModule {}

async function bootstrap() {
  try {
    console.log('Starting seed application...');

    const app = await NestFactory.createApplicationContext(SeedAppModule);

    const seederService = app.get(SeederService);
    await seederService.seedAll();

    await app.close();
    console.log('Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
}

bootstrap();
