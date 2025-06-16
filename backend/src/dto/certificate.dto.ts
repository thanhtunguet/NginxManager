import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsDateString,
} from 'class-validator';
import { ApiProperty, PartialType } from '@nestjs/swagger';

export class CreateCertificateDto {
  @ApiProperty({ description: 'Certificate name/identifier' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'SSL certificate content (PEM format)' })
  @IsString()
  @IsNotEmpty()
  certificate: string;

  @ApiProperty({ description: 'Private key content (PEM format)' })
  @IsString()
  @IsNotEmpty()
  privateKey: string;

  @ApiProperty({ description: 'Certificate issuer/authority' })
  @IsString()
  @IsNotEmpty()
  issuer: string;

  @ApiProperty({ description: 'Certificate expiration date' })
  @IsDateString()
  expiresAt: string;

  @ApiProperty({ description: 'Enable automatic renewal', default: false })
  @IsBoolean()
  @IsOptional()
  autoRenew?: boolean;
}

export class UpdateCertificateDto extends PartialType(CreateCertificateDto) {}

export class CertificateResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;

  @ApiProperty()
  issuer: string;

  @ApiProperty()
  expiresAt: Date;

  @ApiProperty()
  autoRenew: boolean;
}
