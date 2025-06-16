import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Certificate } from '../entities';
import { CreateCertificateDto, UpdateCertificateDto } from '../dto';
import { NginxSettingsService } from './nginx-settings.service';

@Injectable()
export class CertificateService {
  constructor(
    @InjectRepository(Certificate)
    private readonly certificateRepository: Repository<Certificate>,
    private readonly nginxSettingsService: NginxSettingsService,
  ) {}

  async create(
    createCertificateDto: CreateCertificateDto,
  ): Promise<Certificate> {
    const certificate = this.certificateRepository.create(createCertificateDto);
    const savedCertificate = await this.certificateRepository.save(certificate);

    // Save certificate as file
    const sslResult = await this.nginxSettingsService.saveSSLCertificate(
      savedCertificate.name,
      savedCertificate.certificate,
      savedCertificate.privateKey,
    );

    if (!sslResult.success) {
      console.error('Failed to save SSL certificate file:', sslResult.error);
    }

    return savedCertificate;
  }

  async findAll(): Promise<Certificate[]> {
    return await this.certificateRepository.find({
      relations: ['domainMappings'],
    });
  }

  async findOne(id: number): Promise<Certificate> {
    const certificate = await this.certificateRepository.findOne({
      where: { id },
      relations: ['domainMappings'],
    });

    if (!certificate) {
      throw new NotFoundException(`Certificate with ID ${id} not found`);
    }

    return certificate;
  }

  async update(
    id: number,
    updateCertificateDto: UpdateCertificateDto,
  ): Promise<Certificate> {
    const certificate = await this.findOne(id);
    Object.assign(certificate, updateCertificateDto);
    const updatedCertificate =
      await this.certificateRepository.save(certificate);

    // Update certificate file if certificate or private key changed
    if (updateCertificateDto.certificate || updateCertificateDto.privateKey) {
      const sslResult = await this.nginxSettingsService.saveSSLCertificate(
        updatedCertificate.name,
        updatedCertificate.certificate,
        updatedCertificate.privateKey,
      );

      if (!sslResult.success) {
        console.error(
          'Failed to update SSL certificate file:',
          sslResult.error,
        );
      }
    }

    return updatedCertificate;
  }

  async remove(id: number): Promise<void> {
    const certificate = await this.findOne(id);

    // Delete certificate file
    const sslResult = await this.nginxSettingsService.deleteSSLCertificate(
      certificate.name,
    );

    if (!sslResult.success) {
      console.error('Failed to delete SSL certificate file:', sslResult.error);
    }

    await this.certificateRepository.remove(certificate);
  }
}
