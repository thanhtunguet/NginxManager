import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumberString,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, PartialType } from '@nestjs/swagger';
import { HttpServerStatus } from '../entities';
import { LocationResponseDto } from './location.dto';

export class CreateLocationForServerDto {
  @ApiProperty({ description: 'Upstream ID' })
  @IsNumberString(
    {},
    {
      message:
        'upstreamId must be a number conforming to the specified constraints',
    },
  )
  upstreamId: string;

  @ApiProperty({ description: 'Location path pattern', default: '/' })
  @IsString()
  @IsNotEmpty()
  path: string;

  @ApiProperty({
    description: 'Additional NGINX configuration',
    required: false,
  })
  @IsString()
  @IsOptional()
  additionalConfig?: string;

  @ApiProperty({ description: 'Client max body size', default: '1m' })
  @IsString()
  @IsOptional()
  clientMaxBodySize?: string;
}

export class CreateHttpServerDto {
  @ApiProperty({ description: 'Listening port ID' })
  @IsNumberString({}, { message: 'Listening port ID must be a valid number' })
  listeningPortId: string;

  @ApiProperty({ description: 'Server name/identifier' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Additional NGINX configuration',
    required: false,
  })
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

  @ApiProperty({
    description: 'SSL Certificate ID (required for SSL/HTTPS)',
    required: false,
  })
  @IsNumberString(
    {},
    {
      message:
        'certificateId must be a number conforming to the specified constraints',
    },
  )
  @IsOptional()
  certificateId?: string;

  @ApiProperty({
    description: 'Location blocks for this server',
    type: [CreateLocationForServerDto],
    required: false,
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateLocationForServerDto)
  @IsOptional()
  locations?: CreateLocationForServerDto[];
}

export class UpdateHttpServerDto extends PartialType(CreateHttpServerDto) {}

export class HttpServerResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  listeningPortId: string;

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

  @ApiProperty()
  certificateId: string;

  @ApiProperty({ type: [LocationResponseDto] })
  locations: LocationResponseDto[];
}
