import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { CreatePageviewDto } from './dto/create-pageview.dto';
import crypto from 'crypto';

@Injectable()
export class AnalyticsService {
  private readonly prisma = new PrismaClient();

  async record(dto: CreatePageviewDto, ip?: string) {
    const ipHash = crypto.createHash('sha256').update(ip || 'unknown').digest('hex');
    return this.prisma.analyticsPageview.create({
      data: {
        path: dto.path,
        referrer: dto.referrer,
        userAgent: dto.userAgent || 'unknown',
        ipHash,
      },
    });
  }

  async summary() {
    const total = await this.prisma.analyticsPageview.count();
    const byPath = await this.prisma.analyticsPageview.groupBy({
      by: ['path'],
      _count: { path: true },
      orderBy: { _count: { path: 'desc' } },
      take: 10,
    });

    const recent = await this.prisma.$queryRaw<{ date: string; views: bigint }[]>`
      SELECT to_char("createdAt"::date, 'YYYY-MM-DD') as date, count(*) as views
      FROM "AnalyticsPageview"
      WHERE "createdAt" >= NOW() - interval '30 days'
      GROUP BY 1
      ORDER BY 1 asc;
    `;

    return {
      total,
      topPaths: byPath.map((item) => ({ path: item.path, views: item._count.path })),
      trend: recent.map((r) => ({ date: r.date, views: Number(r.views) })),
    };
  }
}
