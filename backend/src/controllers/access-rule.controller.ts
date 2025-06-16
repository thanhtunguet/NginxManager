import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AccessRuleService } from '../services/access-rule.service';
import {
  CreateAccessRuleDto,
  UpdateAccessRuleDto,
  AccessRuleResponseDto,
} from '../dto';

@ApiTags('access-rules')
@Controller('api/v1/access-rules')
export class AccessRuleController {
  constructor(private readonly accessRuleService: AccessRuleService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new access rule' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Access rule created successfully',
    type: AccessRuleResponseDto,
  })
  create(@Body() createAccessRuleDto: CreateAccessRuleDto) {
    return this.accessRuleService.create(createAccessRuleDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all access rules' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of access rules',
    type: [AccessRuleResponseDto],
  })
  findAll() {
    return this.accessRuleService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get access rule by ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Access rule details',
    type: AccessRuleResponseDto,
  })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.accessRuleService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update access rule' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Access rule updated successfully',
    type: AccessRuleResponseDto,
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateAccessRuleDto: UpdateAccessRuleDto,
  ) {
    return this.accessRuleService.update(id, updateAccessRuleDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete access rule' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Access rule deleted successfully',
  })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.accessRuleService.remove(id);
  }
}
