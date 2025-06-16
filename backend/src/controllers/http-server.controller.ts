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
import { HttpServerService } from '../services/http-server.service';
import {
  CreateHttpServerDto,
  UpdateHttpServerDto,
  HttpServerResponseDto,
} from '../dto';

@ApiTags('http-servers')
@Controller('api/v1/servers')
export class HttpServerController {
  constructor(private readonly httpServerService: HttpServerService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new HTTP server' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'HTTP server created successfully',
    type: HttpServerResponseDto,
  })
  create(@Body() createHttpServerDto: CreateHttpServerDto) {
    return this.httpServerService.create(createHttpServerDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all HTTP servers' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of HTTP servers',
    type: [HttpServerResponseDto],
  })
  findAll() {
    return this.httpServerService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get HTTP server by ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'HTTP server details',
    type: HttpServerResponseDto,
  })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.httpServerService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update HTTP server' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'HTTP server updated successfully',
    type: HttpServerResponseDto,
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateHttpServerDto: UpdateHttpServerDto,
  ) {
    return this.httpServerService.update(id, updateHttpServerDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete HTTP server' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'HTTP server deleted successfully',
  })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.httpServerService.remove(id);
  }
}
