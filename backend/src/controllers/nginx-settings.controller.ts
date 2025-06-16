import { Controller, Get, Post, Body, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { NginxSettingsService } from '../services/nginx-settings.service';

@ApiTags('nginx-settings')
@Controller('api/v1/nginx-settings')
export class NginxSettingsController {
  constructor(private readonly nginxSettingsService: NginxSettingsService) {}

  @Get()
  @ApiOperation({ summary: 'Get NGINX service settings' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'NGINX settings retrieved successfully',
  })
  async getSettings() {
    const settings = await this.nginxSettingsService.getSettings();
    return {
      configPath: settings.configPath,
      testCommand: settings.testCommand,
      reloadCommand: settings.reloadCommand,
    };
  }

  @Post()
  @ApiOperation({ summary: 'Save NGINX service settings' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'NGINX settings saved successfully',
  })
  async saveSettings(
    @Body()
    settingsData: {
      configPath: string;
      testCommand: string;
      reloadCommand: string;
    },
  ) {
    const settings = await this.nginxSettingsService.saveSettings(settingsData);
    return {
      message: 'Settings saved successfully',
      configPath: settings.configPath,
      testCommand: settings.testCommand,
      reloadCommand: settings.reloadCommand,
      updatedAt: settings.updatedAt,
    };
  }

  @Post('test')
  @ApiOperation({ summary: 'Test NGINX configuration' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'NGINX configuration test completed',
  })
  async testNginxConfig() {
    const result = await this.nginxSettingsService.testNginxConfig();
    return {
      success: result.success,
      output: result.output,
      error: result.error,
      logs: result.logs,
      command: result.command,
      message: result.success
        ? 'Configuration test passed'
        : 'Configuration test failed',
    };
  }

  @Post('reload')
  @ApiOperation({ summary: 'Reload NGINX service' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'NGINX service reload completed',
  })
  async reloadNginxService() {
    const result = await this.nginxSettingsService.reloadNginxService();
    return {
      success: result.success,
      output: result.output,
      error: result.error,
      logs: result.logs,
      command: result.command,
      message: result.success
        ? 'Service reloaded successfully'
        : 'Service reload failed',
    };
  }
}
