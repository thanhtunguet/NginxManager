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
import { CertificateService } from '../services/certificate.service';
import {
  CertificateResponseDto,
  CreateCertificateDto,
  UpdateCertificateDto,
} from '../dto';

@ApiTags('certificates')
@Controller('api/v1/certificates')
export class CertificateController {
  constructor(private readonly certificateService: CertificateService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new certificate' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Certificate created successfully',
    type: CertificateResponseDto,
  })
  create(@Body() createCertificateDto: CreateCertificateDto) {
    return this.certificateService.create(createCertificateDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all certificates' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of certificates',
    type: [CertificateResponseDto],
  })
  findAll() {
    return this.certificateService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get certificate by ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Certificate details',
    type: CertificateResponseDto,
  })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.certificateService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update certificate' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Certificate updated successfully',
    type: CertificateResponseDto,
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCertificateDto: UpdateCertificateDto,
  ) {
    return this.certificateService.update(id, updateCertificateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete certificate' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Certificate deleted successfully',
  })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.certificateService.remove(id);
  }
}
