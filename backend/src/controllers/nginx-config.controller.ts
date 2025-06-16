import {
  Controller,
  Get,
  Post,
  Param,
  ParseIntPipe,
  HttpStatus,
  Res,
  Query,
  Body,
  Put,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { Response } from 'express';
import { NginxConfigGeneratorService } from '../services/nginx-config-generator.service';

@ApiTags('nginx-config')
@Controller('api/v1/nginx-config')
export class NginxConfigController {
  constructor(
    private readonly nginxConfigGeneratorService: NginxConfigGeneratorService,
  ) {}

  @Get('full')
  @ApiOperation({ summary: 'Generate full NGINX configuration' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Full NGINX configuration generated',
    schema: {
      type: 'object',
      properties: {
        config: { type: 'string' },
        generatedAt: { type: 'string', format: 'date-time' },
      },
    },
  })
  async generateFullConfig() {
    const config = await this.nginxConfigGeneratorService.generateFullConfig();
    return {
      config,
      generatedAt: new Date().toISOString(),
    };
  }

  @Get('server/:id')
  @ApiOperation({ summary: 'Generate configuration for specific server' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Server configuration generated',
    schema: {
      type: 'object',
      properties: {
        config: { type: 'string' },
        serverId: { type: 'number' },
        generatedAt: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Server not found',
  })
  async generateServerConfig(@Param('id', ParseIntPipe) id: number) {
    const config =
      await this.nginxConfigGeneratorService.generateServerConfig(id);
    return {
      config,
      serverId: id,
      generatedAt: new Date().toISOString(),
    };
  }

  @Get('validate')
  @ApiOperation({ summary: 'Validate generated NGINX configuration' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Configuration validation result',
    schema: {
      type: 'object',
      properties: {
        valid: { type: 'boolean' },
        errors: { type: 'array', items: { type: 'string' } },
        validatedAt: { type: 'string', format: 'date-time' },
      },
    },
  })
  async validateConfig() {
    const config = await this.nginxConfigGeneratorService.generateFullConfig();
    const validation =
      await this.nginxConfigGeneratorService.validateConfig(config);
    return {
      ...validation,
      validatedAt: new Date().toISOString(),
    };
  }

  @Post('save')
  @ApiOperation({ summary: 'Generate and save NGINX configuration version' })
  @ApiQuery({ name: 'serverId', required: false, type: Number })
  @ApiQuery({ name: 'name', required: false, type: String })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Configuration saved successfully',
  })
  async saveConfig(
    @Query('serverId') serverId?: number,
    @Query('name') name?: string,
  ) {
    const config = serverId
      ? await this.nginxConfigGeneratorService.generateServerConfig(serverId)
      : await this.nginxConfigGeneratorService.generateFullConfig();

    const savedVersion =
      await this.nginxConfigGeneratorService.saveConfigVersion(
        config,
        serverId,
        name,
      );

    return {
      message: 'Configuration saved successfully',
      versionId: savedVersion.id,
      serverId,
      name: savedVersion.name,
      savedAt: new Date().toISOString(),
    };
  }

  @Get('versions')
  @ApiOperation({ summary: 'Get configuration versions' })
  @ApiQuery({ name: 'serverId', required: false, type: Number })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Configuration versions retrieved',
  })
  async getConfigVersions(@Query('serverId') serverId?: number) {
    const versions =
      await this.nginxConfigGeneratorService.getConfigVersions(serverId);
    return {
      versions,
      serverId,
      retrievedAt: new Date().toISOString(),
    };
  }

  @Get('download')
  @ApiOperation({ summary: 'Download full NGINX configuration as file' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Configuration file downloaded',
  })
  async downloadConfig(@Res() res: Response) {
    const config = await this.nginxConfigGeneratorService.generateFullConfig();
    const filename = `nginx-config-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.conf`;

    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(config);
  }

  @Get('download/server/:id')
  @ApiOperation({
    summary: 'Download server-specific NGINX configuration as file',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Server configuration file downloaded',
  })
  async downloadServerConfig(
    @Param('id', ParseIntPipe) id: number,
    @Res() res: Response,
  ) {
    const config =
      await this.nginxConfigGeneratorService.generateServerConfig(id);
    const filename = `nginx-server-${id}-config-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.conf`;

    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(config);
  }

  @Put('versions/:id/rename')
  @ApiOperation({ summary: 'Rename a configuration version' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Configuration version renamed successfully',
  })
  async renameConfigVersion(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { name: string },
  ) {
    const updatedVersion =
      await this.nginxConfigGeneratorService.updateConfigVersionName(
        id,
        body.name,
      );

    return {
      message: 'Configuration version renamed successfully',
      versionId: updatedVersion.id,
      name: updatedVersion.name,
      updatedAt: new Date().toISOString(),
    };
  }
}
