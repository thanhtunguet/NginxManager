import { IsString, IsNumber, IsEnum, IsOptional, IsIP } from 'class-validator';
import { ApiProperty, PartialType } from '@nestjs/swagger';
import { AccessRuleType, AccessRuleScope } from '../entities';

export class CreateAccessRuleDto {
  @ApiProperty({ description: 'IP address or CIDR block' })
  @IsString()
  @IsIP('4', { message: 'Must be a valid IPv4 address or CIDR block' })
  ipAddress: string;

  @ApiProperty({ enum: AccessRuleType, default: AccessRuleType.ALLOW })
  @IsEnum(AccessRuleType)
  rule: AccessRuleType;

  @ApiProperty({ enum: AccessRuleScope, default: AccessRuleScope.SERVER })
  @IsEnum(AccessRuleScope)
  scope: AccessRuleScope;

  @ApiProperty({ description: 'Server ID (required for server scope)', required: false })
  @IsNumber()
  @IsOptional()
  serverId?: number;

  @ApiProperty({ description: 'Location ID (required for location scope)', required: false })
  @IsNumber()
  @IsOptional()
  locationId?: number;
}

export class UpdateAccessRuleDto extends PartialType(CreateAccessRuleDto) {}

export class AccessRuleResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  ipAddress: string;

  @ApiProperty()
  rule: AccessRuleType;

  @ApiProperty()
  scope: AccessRuleScope;

  @ApiProperty()
  serverId?: number;

  @ApiProperty()
  locationId?: number;
}