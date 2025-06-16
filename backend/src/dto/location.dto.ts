import {
  IsNotEmpty,
  IsNumberString,
  IsOptional,
  IsString,
} from 'class-validator';
import { ApiProperty, PartialType } from '@nestjs/swagger';

export class CreateLocationDto {
  @ApiProperty({ description: 'HTTP Server ID' })
  @IsNumberString()
  serverId: string;

  @ApiProperty({ description: 'Upstream ID' })
  @IsNumberString()
  upstreamId: string;

  @ApiProperty({ description: 'Location path pattern' })
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

export class UpdateLocationDto extends PartialType(CreateLocationDto) {}

export class LocationResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  serverId: string;

  @ApiProperty()
  upstreamId: string;

  @ApiProperty()
  path: string;

  @ApiProperty()
  additionalConfig: string;

  @ApiProperty()
  clientMaxBodySize: string;
}
