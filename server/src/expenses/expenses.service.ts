import { Injectable } from '@nestjs/common'
import { CreateExpenseDto } from './dto/create-expense.dto'
import { CreateExpenseCategoryDto } from './dto/create-expense-category.dto'
import { ImportExpensesDto } from './dto/import-expenses.dto'
import { Currency, Prisma, PrismaClient } from '@prisma/client'
import slugify from 'slugify'

@Injectable()
export class ExpensesService {
  private readonly prisma = new PrismaClient()

  async list(params: {
    page?: number
    pageSize?: number
    search?: string
    categoryId?: string
    year?: number
    month?: number
  }) {
    const page = Math.max(1, Number(params.page) || 1)
    const pageSize = Math.max(1, Math.min(200, Number(params.pageSize) || 20))

    const where: Prisma.ExpenseWhereInput = {}
    if (params.search) {
      where.OR = [
        { title: { contains: params.search, mode: 'insensitive' } },
        { notes: { contains: params.search, mode: 'insensitive' } },
        { category: { name: { contains: params.search, mode: 'insensitive' } } },
      ]
    }
    if (params.categoryId) where.categoryId = params.categoryId
    if (params.year) {
      const from = new Date(params.year, (params.month ?? 1) - 1, 1)
      const to = params.month ? new Date(params.year, params.month, 0, 23, 59, 59, 999) : new Date(params.year + 1, 0, 0, 23, 59, 59, 999)
      where.expenseDate = { gte: from, lte: to }
    }

    const [total, items, aggregates] = await Promise.all([
      this.prisma.expense.count({ where }),
      this.prisma.expense.findMany({
        where,
        include: { category: true },
        orderBy: { expenseDate: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.expense.aggregate({
        where,
        _sum: { amount: true },
      }),
    ])

    return {
      items,
      total,
      aggregates: { totalAmount: aggregates._sum.amount ?? 0 },
    }
  }

  async create(dto: CreateExpenseDto) {
    return this.prisma.expense.create({
      data: {
        expenseDate: new Date(dto.expenseDate),
        title: dto.title,
        amount: new Prisma.Decimal(dto.amount),
        currency: dto.currency ?? Currency.RWF,
        categoryId: dto.categoryId,
        notes: dto.notes,
      },
      include: { category: true },
    })
  }

  async createCategory(dto: CreateExpenseCategoryDto) {
    const slug = slugify(dto.name, { lower: true, strict: true })
    return this.prisma.expenseCategory.create({
      data: { name: dto.name, slug },
    })
  }

  async listCategories() {
    return this.prisma.expenseCategory.findMany({ orderBy: { name: 'asc' } })
  }

  async importRows(dto: ImportExpensesDto) {
    const rows = dto.rows || []
    let created = 0
    const errors: Array<{ row: any; error: string }> = []
    for (const row of rows) {
      try {
        const title = row.Details || row.details || row.title
        const dateStr = row.Date || row.date
        const catName = row.Category || row.category || 'Uncategorized'
        const rawAmount = row['Amount (RWF)'] || row.amount || row.Amount
        if (!title || !dateStr || !rawAmount) continue
        const amountNum = Number(String(rawAmount).replace(/,/g, ''))
        const expenseDate = new Date(dateStr)
        if (Number.isNaN(amountNum) || isNaN(expenseDate.getTime())) continue
        const category = await this.upsertCategoryByName(catName)
        await this.prisma.expense.create({
          data: {
            expenseDate,
            title,
            amount: new Prisma.Decimal(amountNum),
            currency: dto.defaultCurrency && dto.defaultCurrency in Currency ? (dto.defaultCurrency as Currency) : Currency.RWF,
            categoryId: category.id,
            notes: row.Notes || row.notes || undefined,
          },
        })
        created++
      } catch (err: any) {
        errors.push({ row, error: err?.message || 'unknown error' })
      }
    }
    return { created, errors }
  }

  private async upsertCategoryByName(name: string) {
    const slug = slugify(name, { lower: true, strict: true })
    const existing = await this.prisma.expenseCategory.findUnique({ where: { slug } })
    if (existing) return existing
    return this.prisma.expenseCategory.create({ data: { name, slug } })
  }

  async summary(year?: number) {
    const where: Prisma.ExpenseWhereInput = {}
    if (year) {
      where.expenseDate = { gte: new Date(year, 0, 1), lte: new Date(year + 1, 0, 0, 23, 59, 59, 999) }
    }
    const [sum, byCategory] = await Promise.all([
      this.prisma.expense.aggregate({ where, _sum: { amount: true } }),
      this.prisma.expense.groupBy({ where, by: ['categoryId'], _sum: { amount: true } }),
    ])
    const categories = await this.prisma.expenseCategory.findMany({ where: { id: { in: byCategory.map((b) => b.categoryId) } } })
    return {
      totalAmount: sum._sum.amount ?? 0,
      byCategory: byCategory.map((b) => ({
        categoryId: b.categoryId,
        categoryName: categories.find((c) => c.id === b.categoryId)?.name ?? 'Unknown',
        amount: b._sum.amount ?? 0,
      })),
    }
  }

  async monthly(year?: number) {
    if (year) {
      const rows = await this.prisma.$queryRaw<any[]>`SELECT EXTRACT(MONTH FROM "expenseDate") as month, SUM(amount) as total
        FROM "Expense"
        WHERE EXTRACT(YEAR FROM "expenseDate") = ${year}
        GROUP BY month
        ORDER BY month`
      return {
        year,
        months: rows.map((r) => ({ month: Number(r.month), total: Number(r.total) })),
      }
    }
    const rows = await this.prisma.$queryRaw<any[]>`SELECT EXTRACT(MONTH FROM "expenseDate") as month, SUM(amount) as total
      FROM "Expense"
      GROUP BY month
      ORDER BY month`
    return {
      year: year ?? null,
      months: rows.map((r) => ({ month: Number(r.month), total: Number(r.total) })),
    }
  }
}
