import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
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
      sslCertificatesPath: settings.sslCertificatesPath,
      sslPrivateKeysPath: settings.sslPrivateKeysPath,
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
      sslCertificatesPath: string;
      sslPrivateKeysPath: string;
    },
  ) {
    const settings = await this.nginxSettingsService.saveSettings(settingsData);
    return {
      message: 'Settings saved successfully',
      configPath: settings.configPath,
      testCommand: settings.testCommand,
      reloadCommand: settings.reloadCommand,
      sslCertificatesPath: settings.sslCertificatesPath,
      sslPrivateKeysPath: settings.sslPrivateKeysPath,
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

  @Post('ssl/save')
  @ApiOperation({ summary: 'Save SSL certificate and private key' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'SSL certificate saved successfully',
  })
  async saveSSLCertificate(
    @Body()
    sslData: {
      domain: string;
      certificate: string;
      privateKey: string;
    },
  ) {
    const result = await this.nginxSettingsService.saveSSLCertificate(
      sslData.domain,
      sslData.certificate,
      sslData.privateKey,
    );
    return {
      success: result.success,
      error: result.error,
      certPath: result.certPath,
      keyPath: result.keyPath,
      message: result.success
        ? 'SSL certificate saved successfully'
        : 'Failed to save SSL certificate',
    };
  }

  @Delete('ssl/delete/:domain')
  @ApiOperation({ summary: 'Delete SSL certificate and private key' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'SSL certificate deleted successfully',
  })
  async deleteSSLCertificate(@Param('domain') domain: string) {
    const result = await this.nginxSettingsService.deleteSSLCertificate(domain);
    return {
      success: result.success,
      error: result.error,
      message: result.success
        ? 'SSL certificate deleted successfully'
        : 'Failed to delete SSL certificate',
    };
  }
}
