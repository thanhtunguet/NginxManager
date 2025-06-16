import {
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { ApiProperty, PartialType } from '@nestjs/swagger';

export enum PortProtocol {
  HTTP = 'http',
  HTTPS = 'https',
}

export class CreateListeningPortDto {
  @ApiProperty({
    description: 'Name of the listening port',
    example: 'Main HTTP Port',
  })
  @IsString()
  @MinLength(2)
  @MaxLength(255)
  name: string;

  @ApiProperty({ description: 'Port number', minimum: 1, maximum: 65535 })
  @IsNumber()
  @Min(1)
  @Max(65535)
  port: number;

  @ApiProperty({ enum: PortProtocol, default: PortProtocol.HTTP })
  @IsEnum(PortProtocol)
  protocol: PortProtocol;

  @ApiProperty({ description: 'Enable SSL', default: false })
  @IsBoolean()
  @IsOptional()
  ssl?: boolean;

  @ApiProperty({ description: 'Enable HTTP/2', default: false })
  @IsBoolean()
  @IsOptional()
  http2?: boolean;
}

export class UpdateListeningPortDto extends PartialType(
  CreateListeningPortDto,
) {}

export class ListeningPortResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;

  @ApiProperty()
  port: number;

  @ApiProperty()
  protocol: PortProtocol;

  @ApiProperty()
  ssl: boolean;

  @ApiProperty()
  http2: boolean;
}
