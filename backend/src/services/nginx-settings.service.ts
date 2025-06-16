import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';
import { NginxSettings } from '../entities/nginx-settings.entity';

const execAsync = promisify(exec);

@Injectable()
export class NginxSettingsService {
  constructor(
    @InjectRepository(NginxSettings)
    private readonly nginxSettingsRepository: Repository<NginxSettings>,
  ) {}

  async getSettings(): Promise<NginxSettings> {
    let settings = await this.nginxSettingsRepository.findOne({
      where: {},
      order: { id: 'DESC' },
    });

    if (!settings) {
      // Create default settings if none exist
      settings = this.nginxSettingsRepository.create({
        configPath: '/etc/nginx/nginx.conf',
        testCommand: '#!/bin/bash\nnginx -t',
        reloadCommand: '#!/bin/bash\nnginx -s reload',
        sslCertificatesPath: '/etc/nginx/ssl/certs',
        sslPrivateKeysPath: '/etc/nginx/ssl/private',
      });
      await this.nginxSettingsRepository.save(settings);
    }

    return settings;
  }

  async saveSettings(
    settingsData: Partial<NginxSettings>,
  ): Promise<NginxSettings> {
    let settings = await this.nginxSettingsRepository.findOne({
      where: {},
      order: { id: 'DESC' },
    });

    if (!settings) {
      settings = this.nginxSettingsRepository.create(settingsData);
    } else {
      Object.assign(settings, settingsData);
    }

    return await this.nginxSettingsRepository.save(settings);
  }

  async testNginxConfig(): Promise<{
    success: boolean;
    output: string;
    error?: string;
    logs: string;
    command: string;
  }> {
    try {
      const settings = await this.getSettings();

      // Create a temporary script file
      const scriptContent = settings.testCommand;
      const scriptPath = `/tmp/nginx-test-${Date.now()}.sh`;

      // Write script to file
      fs.writeFileSync(scriptPath, scriptContent);
      fs.chmodSync(scriptPath, '755');

      // Execute the script
      const { stdout, stderr } = await execAsync(`bash ${scriptPath}`);

      // Clean up
      fs.unlinkSync(scriptPath);

      // Combine stdout and stderr for logs
      const logs = `${stdout}${stderr ? '\n' + stderr : ''}`;

      // Check if the command was successful (nginx -t returns 0 on success)
      // For nginx -t, success is indicated by no error output or specific success messages
      const isSuccess =
        !stderr ||
        stderr.trim() === '' ||
        stderr.includes('test is successful');

      return {
        success: isSuccess,
        output: stdout,
        error: stderr || undefined,
        logs: logs,
        command: settings.testCommand,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      return {
        success: false,
        output: '',
        error: errorMessage,
        logs: `Error: ${errorMessage}`,
        command: 'Command execution failed',
      };
    }
  }

  async reloadNginxService(): Promise<{
    success: boolean;
    output: string;
    error?: string;
    logs: string;
    command: string;
  }> {
    try {
      const settings = await this.getSettings();

      // Create a temporary script file
      const scriptContent = settings.reloadCommand;
      const scriptPath = `/tmp/nginx-reload-${Date.now()}.sh`;

      // Write script to file
      fs.writeFileSync(scriptPath, scriptContent);
      fs.chmodSync(scriptPath, '755');

      // Execute the script
      const { stdout, stderr } = await execAsync(`bash ${scriptPath}`);

      // Clean up
      fs.unlinkSync(scriptPath);

      // Combine stdout and stderr for logs
      const logs = `${stdout}${stderr ? '\n' + stderr : ''}`;

      // Check if the command was successful (nginx -s reload returns 0 on success)
      const isSuccess = !stderr || stderr.trim() === '';

      return {
        success: isSuccess,
        output: stdout,
        error: stderr || undefined,
        logs: logs,
        command: settings.reloadCommand,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      return {
        success: false,
        output: '',
        error: errorMessage,
        logs: `Error: ${errorMessage}`,
        command: 'Command execution failed',
      };
    }
  }

  async saveConfigToFile(
    configContent: string,
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const settings = await this.getSettings();

      // Write config to file
      fs.writeFileSync(settings.configPath, configContent);

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  async saveSSLCertificate(
    domain: string,
    certificateContent: string,
    privateKeyContent: string,
  ): Promise<{
    success: boolean;
    error?: string;
    certPath?: string;
    keyPath?: string;
  }> {
    try {
      const settings = await this.getSettings();

      // Create directories if they don't exist
      if (!fs.existsSync(settings.sslCertificatesPath)) {
        fs.mkdirSync(settings.sslCertificatesPath, { recursive: true });
      }
      if (!fs.existsSync(settings.sslPrivateKeysPath)) {
        fs.mkdirSync(settings.sslPrivateKeysPath, { recursive: true });
      }

      // Sanitize domain name for filename
      const sanitizedDomain = domain.replace(/[^a-zA-Z0-9.-]/g, '_');

      // Define file paths
      const certPath = path.join(
        settings.sslCertificatesPath,
        `${sanitizedDomain}.crt`,
      );
      const keyPath = path.join(
        settings.sslPrivateKeysPath,
        `${sanitizedDomain}.key`,
      );

      // Write certificate file
      fs.writeFileSync(certPath, certificateContent);

      // Write private key file with restricted permissions
      fs.writeFileSync(keyPath, privateKeyContent);
      fs.chmodSync(keyPath, '600'); // Read/write for owner only

      return {
        success: true,
        certPath: certPath,
        keyPath: keyPath,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  async deleteSSLCertificate(
    domain: string,
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const settings = await this.getSettings();

      // Sanitize domain name for filename
      const sanitizedDomain = domain.replace(/[^a-zA-Z0-9.-]/g, '_');

      // Define file paths
      const certPath = path.join(
        settings.sslCertificatesPath,
        `${sanitizedDomain}.crt`,
      );
      const keyPath = path.join(
        settings.sslPrivateKeysPath,
        `${sanitizedDomain}.key`,
      );

      // Delete certificate file if it exists
      if (fs.existsSync(certPath)) {
        fs.unlinkSync(certPath);
      }

      // Delete private key file if it exists
      if (fs.existsSync(keyPath)) {
        fs.unlinkSync(keyPath);
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }
}
