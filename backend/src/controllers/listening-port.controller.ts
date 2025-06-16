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
import { ListeningPortService } from '../services/listening-port.service';
import {
  CreateListeningPortDto,
  ListeningPortResponseDto,
  UpdateListeningPortDto,
} from '../dto';

@ApiTags('Listening Ports')
@Controller('api/v1/listening-ports')
export class ListeningPortController {
  constructor(private readonly listeningPortService: ListeningPortService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new listening port' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Listening port created successfully',
    type: ListeningPortResponseDto,
  })
  create(@Body() createListeningPortDto: CreateListeningPortDto) {
    return this.listeningPortService.create(createListeningPortDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all listening ports' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of listening ports',
    type: [ListeningPortResponseDto],
  })
  findAll() {
    return this.listeningPortService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get listening port by ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Listening port details',
    type: ListeningPortResponseDto,
  })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.listeningPortService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update listening port' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Listening port updated successfully',
    type: ListeningPortResponseDto,
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateListeningPortDto: UpdateListeningPortDto,
  ) {
    return this.listeningPortService.update(id, updateListeningPortDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete listening port' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Listening port deleted successfully',
  })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.listeningPortService.remove(id);
  }
}
