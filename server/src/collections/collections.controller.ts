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
import { CollectionsService } from './collections.service'
import { CreateCollectionDto } from './dto/create-collection.dto'
import { UpdateCollectionDto } from './dto/update-collection.dto'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'

@ApiTags('Collections')
@Controller('collections')
export class CollectionsController {
    constructor(private readonly service: CollectionsService) {}

    @Get()
    findAll() {
        return this.service.findAll()
    }

    @ApiBearerAuth()
    @ApiBody({
        type: CreateCollectionDto,
        examples: {
            default: {
                summary: 'Create collection',
                value: {
                    name: 'Prime Suits',
                    slug: 'prime-suits',
                    description: 'Signature suits',
                },
            },
        },
    })
    @UseGuards(JwtAuthGuard)
    @Post()
    create(@Body() dto: CreateCollectionDto) {
        return this.service.create(dto)
    }

    @ApiBearerAuth()
    @ApiBody({ type: UpdateCollectionDto })
    @UseGuards(JwtAuthGuard)
    @Patch(':id')
    update(@Param('id') id: string, @Body() dto: UpdateCollectionDto) {
        return this.service.update(id, dto)
    }

    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.service.remove(id)
    }
}
