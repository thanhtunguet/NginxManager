import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS
  app.enableCors();

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('NGINX Configuration Manager API')
    .setDescription('API for managing NGINX configurations')
    .setVersion('1.0')
    .addTag('upstreams', 'Upstream management')
    .addTag('domains', 'Domain management')
    .addTag('certificates', 'Certificate management')
    .addTag('http-servers', 'HTTP server management')
    .addTag('listening-ports', 'Listening port management')
    .addTag('locations', 'Location management')
    .addTag('access-rules', 'Access rule management')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.PORT ?? 3000);
  console.log(
    `Application is running on: http://localhost:${process.env.PORT ?? 3000}`,
  );
  console.log(
    `Swagger documentation available at: http://localhost:${process.env.PORT ?? 3000}/api`,
  );
}

bootstrap();
