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
import { UpstreamService } from '../services/upstream.service';
import {
  CreateUpstreamDto,
  UpdateUpstreamDto,
  UpstreamResponseDto,
} from '../dto';

@ApiTags('upstreams')
@Controller('api/v1/upstreams')
export class UpstreamController {
  constructor(private readonly upstreamService: UpstreamService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new upstream' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Upstream created successfully',
    type: UpstreamResponseDto,
  })
  create(@Body() createUpstreamDto: CreateUpstreamDto) {
    return this.upstreamService.create(createUpstreamDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all upstreams' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of upstreams',
    type: [UpstreamResponseDto],
  })
  findAll() {
    return this.upstreamService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get upstream by ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Upstream details',
    type: UpstreamResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Upstream not found',
  })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.upstreamService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update upstream' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Upstream updated successfully',
    type: UpstreamResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Upstream not found',
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUpstreamDto: UpdateUpstreamDto,
  ) {
    return this.upstreamService.update(id, updateUpstreamDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete upstream' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Upstream deleted successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Upstream not found',
  })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.upstreamService.remove(id);
  }
}
