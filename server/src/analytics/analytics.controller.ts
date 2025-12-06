import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger'
import { AnalyticsService } from './analytics.service'
import { CreatePageviewDto } from './dto/create-pageview.dto'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { Request } from 'express'

@ApiTags('Analytics')
@Controller('analytics')
export class AnalyticsController {
    constructor(private readonly service: AnalyticsService) {}

    @ApiBody({
        type: CreatePageviewDto,
        examples: {
            default: {
                summary: 'Record pageview',
                value: {
                    path: '/products/classic-black-tuxedo',
                    referrer: 'https://primecouture.rw',
                    userAgent: 'Mozilla/5.0',
                },
            },
        },
    })
    @Post('pageview')
    record(@Body() dto: CreatePageviewDto, @Req() req: Request) {
        const ip = (req.headers['x-forwarded-for'] as string) || req.ip
        return this.service.record(dto, ip)
    }

    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Get('summary')
    summary() {
        return this.service.summary()
    }
}
