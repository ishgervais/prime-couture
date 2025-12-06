import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
    UseGuards,
} from '@nestjs/common'
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger'
import { CategoriesService } from './categories.service'
import { CreateCategoryDto } from './dto/create-category.dto'
import { UpdateCategoryDto } from './dto/update-category.dto'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'

@ApiTags('Categories')
@Controller('categories')
export class CategoriesController {
    constructor(private readonly service: CategoriesService) {}

    @Get()
    findAll() {
        return this.service.findAll()
    }

    @ApiBearerAuth()
    @ApiBody({
        type: CreateCategoryDto,
        examples: {
            default: {
                summary: 'Create category',
                value: {
                    name: 'Suits',
                    slug: 'suits',
                    description: 'Men and women suits',
                },
            },
        },
    })
    @UseGuards(JwtAuthGuard)
    @Post()
    create(@Body() dto: CreateCategoryDto) {
        return this.service.create(dto)
    }

    @ApiBearerAuth()
    @ApiBody({ type: UpdateCategoryDto })
    @UseGuards(JwtAuthGuard)
    @Patch(':id')
    update(@Param('id') id: string, @Body() dto: UpdateCategoryDto) {
        return this.service.update(id, dto)
    }

    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.service.remove(id)
    }
}
