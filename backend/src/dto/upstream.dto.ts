import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { ApiProperty, PartialType } from '@nestjs/swagger';
import { UpstreamStatus } from '../entities';

export class CreateUpstreamDto {
  @ApiProperty({ description: 'Name of the upstream' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Server address and port' })
  @IsString()
  @IsNotEmpty()
  server: string;

  @ApiProperty({ description: 'Keep-alive connections count', default: 32 })
  @IsNumber()
  @Min(1)
  @Max(1000)
  keepAlive: number;

  @ApiProperty({ enum: UpstreamStatus, default: UpstreamStatus.ACTIVE })
  @IsEnum(UpstreamStatus)
  @IsOptional()
  status?: UpstreamStatus;

  @ApiProperty({ description: 'Health check path' })
  @IsString()
  @IsNotEmpty()
  healthCheckPath: string;

  @ApiProperty({ description: 'Health check interval in seconds', default: 50 })
  @IsNumber()
  @Min(1)
  @Max(3600)
  @IsOptional()
  healthCheckInterval?: number;

  @ApiProperty({
    description: 'Maximum failures before marking as down',
    default: 3,
  })
  @IsNumber()
  @Min(1)
  @Max(10)
  @IsOptional()
  maxFails?: number;
}

export class UpdateUpstreamDto extends PartialType(CreateUpstreamDto) {}

export class UpstreamResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;

  @ApiProperty()
  server: string;

  @ApiProperty()
  keepAlive: number;

  @ApiProperty()
  status: UpstreamStatus;

  @ApiProperty()
  healthCheckPath: string;

  @ApiProperty()
  healthCheckInterval: number;

  @ApiProperty()
  maxFails: number;
}
