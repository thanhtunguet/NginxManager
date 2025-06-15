import { IsString, IsNotEmpty, Matches } from 'class-validator';
import { ApiProperty, PartialType } from '@nestjs/swagger';

export class CreateDomainDto {
  @ApiProperty({ description: 'Domain name (e.g., example.com, *.example.com)' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^(\*\.)?[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*$/, {
    message: 'Invalid domain format',
  })
  domain: string;
}

export class UpdateDomainDto extends PartialType(CreateDomainDto) {}

export class DomainResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  domain: string;
}