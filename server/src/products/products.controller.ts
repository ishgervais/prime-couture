import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { CreateImageDto } from './dto/create-image.dto';
import { UpdateImageDto } from './dto/update-image.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Currency } from '@prisma/client';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(private readonly service: ProductsService) {}

  @Get()
  findAll(
    @Query('collection') collectionSlug?: string,
    @Query('category') categorySlug?: string,
    @Query('search') search?: string,
    @Query('active') active?: string,
    @Query('currency') currency?: Currency,
  ) {
    return this.service.findAll({
      collectionSlug,
      categorySlug,
      search,
      isActive: active !== undefined ? active === 'true' : undefined,
      currency,
    });
  }

  @Get(':slug')
  findBySlug(@Param('slug') slug: string) {
    return this.service.findBySlug(slug);
  }

  @ApiBearerAuth()
  @ApiBody({
    type: CreateProductDto,
    examples: {
      default: {
        summary: 'Create product',
        value: {
          title: 'Classic Black Tuxedo',
          slug: 'classic-black-tuxedo',
          description: 'A timeless black tuxedo tailored in Kigali.',
          priceAmount: 280000,
          priceCurrency: 'RWF',
          collectionId: 'collection-uuid',
          categoryId: 'category-uuid',
          isActive: true,
        },
      },
    },
  })
  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() dto: CreateProductDto) {
    return this.service.create(dto);
  }

  @ApiBearerAuth()
  @ApiBody({ type: UpdateProductDto })
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.service.update(id, dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }

  @ApiBearerAuth()
  @ApiBody({
    type: CreateImageDto,
    isArray: true,
    examples: {
      default: {
        summary: 'Attach images',
        value: [
          { imageUrl: 'https://res.cloudinary.com/demo/image/upload/sample.jpg', altText: 'Front view', position: 0 },
          { fileId: 'existing-file-id', altText: 'Detail shot', position: 1 },
        ],
      },
    },
  })
  @UseGuards(JwtAuthGuard)
  @Post(':id/images')
  addImages(@Param('id') id: string, @Body() dto: CreateImageDto | CreateImageDto[]) {
    const images = Array.isArray(dto) ? dto : [dto];
    return this.service.addImages(id, images);
  }

  @ApiBearerAuth()
  @ApiBody({
    type: UpdateImageDto,
    examples: {
      default: { summary: 'Update image', value: { altText: 'New alt', position: 1, fileId: 'new-file-id' } },
    },
  })
  @UseGuards(JwtAuthGuard)
  @Patch(':id/images/:imageId')
  updateImage(@Param('id') id: string, @Param('imageId') imageId: string, @Body() dto: UpdateImageDto) {
    return this.service.updateImage(id, imageId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id/images/:imageId')
  removeImage(@Param('id') id: string, @Param('imageId') imageId: string) {
    return this.service.removeImage(id, imageId);
  }
}
