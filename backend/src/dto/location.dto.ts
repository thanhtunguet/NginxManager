import { IsString, IsNumber, IsOptional, IsNotEmpty } from 'class-validator';
import { ApiProperty, PartialType } from '@nestjs/swagger';

export class CreateLocationDto {
  @ApiProperty({ description: 'HTTP Server ID' })
  @IsNumber()
  serverId: number;

  @ApiProperty({ description: 'Upstream ID' })
  @IsNumber()
  upstreamId: number;

  @ApiProperty({ description: 'Location path pattern' })
  @IsString()
  @IsNotEmpty()
  path: string;

  @ApiProperty({ description: 'Additional NGINX configuration', required: false })
  @IsString()
  @IsOptional()
  additionalConfig?: string;

  @ApiProperty({ description: 'Client max body size', default: '1m' })
  @IsString()
  @IsOptional()
  clientMaxBodySize?: string;
}

export class UpdateLocationDto extends PartialType(CreateLocationDto) {}

export class LocationResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  serverId: number;

  @ApiProperty()
  upstreamId: number;

  @ApiProperty()
  path: string;

  @ApiProperty()
  additionalConfig: string;

  @ApiProperty()
  clientMaxBodySize: string;
}