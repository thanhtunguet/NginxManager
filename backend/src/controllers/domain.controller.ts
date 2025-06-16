import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { DomainService } from '../services/domain.service';
import { CreateDomainDto, DomainResponseDto, UpdateDomainDto } from '../dto';

@ApiTags('Domains')
@Controller('api/v1/domains')
export class DomainController {
  constructor(private readonly domainService: DomainService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new domain' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Domain created successfully',
    type: DomainResponseDto,
  })
  create(@Body() createDomainDto: CreateDomainDto) {
    return this.domainService.create(createDomainDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all domains' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of domains',
    type: [DomainResponseDto],
  })
  findAll() {
    return this.domainService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get domain by ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Domain details',
    type: DomainResponseDto,
  })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.domainService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update domain' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Domain updated successfully',
    type: DomainResponseDto,
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDomainDto: UpdateDomainDto,
  ) {
    return this.domainService.update(id, updateDomainDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete domain' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Domain deleted successfully',
  })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.domainService.remove(id);
  }
}
