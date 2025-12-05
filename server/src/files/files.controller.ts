import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { FilesService } from './files.service';

@ApiTags('Files')
@Controller('files')
export class FilesController {
  constructor(private readonly service: FilesService) {}

  @ApiBearerAuth()
  @ApiQuery({
    name: 'folder',
    required: false,
    type: String,
    example: 'prime-couture/products/classic-black-tuxedo',
  })
  @UseGuards(JwtAuthGuard)
  @Get('upload-signature')
  getSignature(@Query('folder') folder?: string) {
    return this.service.getUploadSignature(folder);
  }
}
