import { IsString, IsNumber, IsEnum, IsOptional, IsNotEmpty } from 'class-validator';
import { ApiProperty, PartialType } from '@nestjs/swagger';
import { HttpServerStatus } from '../entities';

export class CreateHttpServerDto {
  @ApiProperty({ description: 'Listening port ID' })
  @IsNumber()
  listeningPortId: number;

  @ApiProperty({ description: 'Server name/identifier' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Additional NGINX configuration', required: false })
  @IsString()
  @IsOptional()
  additionalConfig?: string;

  @ApiProperty({ enum: HttpServerStatus, default: HttpServerStatus.ACTIVE })
  @IsEnum(HttpServerStatus)
  @IsOptional()
  status?: HttpServerStatus;

  @ApiProperty({ description: 'Access log file path', default: '/dev/null' })
  @IsString()
  @IsOptional()
  accessLogPath?: string;

  @ApiProperty({ description: 'Error log file path', default: '/dev/null' })
  @IsString()
  @IsOptional()
  errorLogPath?: string;

  @ApiProperty({ description: 'Log level', default: 'warn' })
  @IsString()
  @IsOptional()
  logLevel?: string;
}

export class UpdateHttpServerDto extends PartialType(CreateHttpServerDto) {}

export class HttpServerResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  listeningPortId: number;

  @ApiProperty()
  name: string;

  @ApiProperty()
  additionalConfig: string;

  @ApiProperty()
  status: HttpServerStatus;

  @ApiProperty()
  accessLogPath: string;

  @ApiProperty()
  errorLogPath: string;

  @ApiProperty()
  logLevel: string;
}