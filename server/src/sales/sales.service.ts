import {
    Injectable,
    BadRequestException,
    NotFoundException,
} from '@nestjs/common'
import {
    Currency,
    PaymentMethod,
    PaymentStatus,
    Prisma,
    PrismaClient,
    SaleStatus,
} from '@prisma/client'
import { CreateSaleDto } from './dto/create-sale.dto'
import { UpdateSaleDto } from './dto/update-sale.dto'
import { CreatePaymentDto } from './dto/create-payment.dto'
import { CreateClientDto } from '../clients/dto/create-client.dto'

@Injectable()
export class SalesService {
    private readonly prisma = new PrismaClient()

    private calcPaymentStatus(
        totalPaid: number,
        totalAmount: number
    ): PaymentStatus {
        if (totalPaid <= 0) return PaymentStatus.NONE
        if (totalPaid >= totalAmount) return PaymentStatus.FULL
        return PaymentStatus.PARTIAL
    }

    private toDecimal(n: number | string | Prisma.Decimal) {
        return new Prisma.Decimal(n)
    }

    private pascalCase(name: string) {
        return name
            .trim()
            .split(/\s+/)
            .map(
                (part) =>
                    part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()
            )
            .join(' ')
    }

    private slugify(text: string) {
        return text
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '')
    }

    private parseNumber(value?: string | number | null) {
        if (value === null || value === undefined) return 0
        if (typeof value === 'number') return value
        const cleaned = value.replace(/,/g, '').trim()
        const num = Number(cleaned)
        return Number.isNaN(num) ? 0 : num
    }

    private mapPaymentMethod(text?: string): PaymentMethod {
        const t = (text || '').toLowerCase()
        if (t.includes('mobile')) return PaymentMethod.MOBILE_MONEY
        if (t.includes('cash')) return PaymentMethod.CASH
        if (t.includes('card')) return PaymentMethod.CARD
        if (t.includes('bank')) return PaymentMethod.BANK_TRANSFER
        return PaymentMethod.OTHER
    }

    private async ensureDefaultGroups() {
        const collectionSlug = 'imported'
        const categorySlug = 'imported'
        const [collection] = await this.prisma.$transaction([
            this.prisma.collection.upsert({
                where: { slug: collectionSlug },
                create: { name: 'Imported', slug: collectionSlug },
                update: {},
            }),
        ])
        const category = await this.prisma.category.upsert({
            where: { slug: categorySlug },
            create: { name: 'Imported', slug: categorySlug },
            update: {},
        })
        return { collection, category }
    }

    private async ensureProduct(
        title: string,
        unitPrice: number,
        categoryId: string,
        collectionId: string
    ) {
        const existing = await this.prisma.product.findFirst({
            where: { title: { equals: title, mode: 'insensitive' } },
        })
        if (existing) return existing.id
        const slugBase = this.slugify(title)
        const slug = `${slugBase}-${Math.random().toString(36).slice(2, 6)}`
        const product = await this.prisma.product.create({
            data: {
                title,
                slug,
                description: 'Imported record',
                priceAmount: this.toDecimal(unitPrice || 0),
                priceCurrency: Currency.RWF,
                isActive: false,
                collectionId,
                categoryId,
            },
        })
        return product.id
    }

    private async ensureClient(dto: CreateSaleDto): Promise<string> {
        if (dto.clientId) return dto.clientId
        if (!dto.clientName) {
            throw new BadRequestException('Provide clientId or clientName')
        }
        const newClient: CreateClientDto = {
            fullName: dto.clientName,
            phone: dto.clientPhone ?? 'N/A',
            email: dto.clientEmail,
        }
        const client = await this.prisma.client.create({
            data: {
                fullName: newClient.fullName,
                phone: newClient.phone ?? 'N/A',
                email: newClient.email,
            },
        })
        return client.id
    }

    async create(dto: CreateSaleDto) {
        const clientId = await this.ensureClient(dto)
        const product = await this.prisma.product.findUnique({
            where: { id: dto.productId },
        })
        if (!product) throw new BadRequestException('Product not found')

        const quantity = Number(dto.quantity)
        const unitPrice = Number(dto.unitPrice)
        const productionCost = dto.productionCost
            ? Number(dto.productionCost)
            : 0
        const prePayment = Number(dto.prePaymentAmount)
        const totalAmount = quantity * unitPrice
        const totalPaid = prePayment
        const remainingAmount = totalAmount - totalPaid
        const profit = totalAmount - productionCost
        const paymentStatus = this.calcPaymentStatus(totalPaid, totalAmount)

        const sale = await this.prisma.sale.create({
            data: {
                clientId,
                productId: dto.productId,
                saleDate: new Date(dto.saleDate),
                pickupDate: dto.pickupDate ? new Date(dto.pickupDate) : null,
                quantity,
                unitPrice: this.toDecimal(unitPrice),
                currency: dto.currency,
                totalAmount: this.toDecimal(totalAmount),
                prePaymentAmount: this.toDecimal(prePayment),
                totalPaid: this.toDecimal(totalPaid),
                remainingAmount: this.toDecimal(Math.max(remainingAmount, 0)),
                productionCost: dto.productionCost
                    ? this.toDecimal(productionCost)
                    : null,
                profit: this.toDecimal(profit),
                paymentStatus,
                paymentMethod: dto.paymentMethod,
                status: SaleStatus.ACTIVE,
                notes: dto.notes,
            },
            include: {
                client: true,
                product: true,
                payments: true,
            },
        })

        if (prePayment > 0) {
            await this.prisma.payment.create({
                data: {
                    saleId: sale.id,
                    amount: this.toDecimal(prePayment),
                    currency: dto.currency,
                    paymentMethod: dto.paymentMethod,
                    paidAt: new Date(dto.saleDate),
                    note: 'Pre-payment',
                },
            })
        }

        return sale
    }

    async findAll(params: {
        from?: string
        to?: string
        paymentStatus?: PaymentStatus
        paymentMethod?: PaymentMethod
        clientId?: string
        productId?: string
        categoryId?: string
        search?: string
        page?: number
        pageSize?: number
    }) {
        const where: Prisma.SaleWhereInput = {}
        if (params.from || params.to) {
            where.saleDate = {}
            if (params.from) where.saleDate.gte = new Date(params.from)
            if (params.to) where.saleDate.lte = new Date(params.to)
        }
        if (params.paymentStatus) where.paymentStatus = params.paymentStatus
        if (params.paymentMethod) where.paymentMethod = params.paymentMethod
        if (params.clientId) where.clientId = params.clientId
        if (params.productId) where.productId = params.productId
        if (params.categoryId) where.product = { categoryId: params.categoryId }
        if (params.search && params.search.trim().length) {
            const q = params.search.trim()
            where.OR = [
                { client: { fullName: { contains: q, mode: 'insensitive' } } },
                { product: { title: { contains: q, mode: 'insensitive' } } },
            ]
        }

        const page = params.page && params.page > 0 ? params.page : 1
        const pageSize =
            params.pageSize && params.pageSize > 0 ? params.pageSize : 10
        const skip = (page - 1) * pageSize

        const [items, total, aggregates] = await Promise.all([
            this.prisma.sale.findMany({
                where,
                orderBy: { saleDate: 'desc' },
                include: {
                    client: true,
                    product: { include: { category: true } },
                    payments: true,
                },
                skip,
                take: pageSize,
            }),
            this.prisma.sale.count({ where }),
            this.prisma.sale.aggregate({
                where,
                _sum: {
                    totalAmount: true,
                    totalPaid: true,
                    remainingAmount: true,
                    profit: true,
                },
            }),
        ])

        return {
            items,
            total,
            page,
            pageSize,
            aggregates: {
                totalAmount: Number(aggregates._sum.totalAmount ?? 0),
                totalPaid: Number(aggregates._sum.totalPaid ?? 0),
                remainingAmount: Number(aggregates._sum.remainingAmount ?? 0),
                profit: Number(aggregates._sum.profit ?? 0),
            },
        }
    }

    async findOne(id: string) {
        const sale = await this.prisma.sale.findUnique({
            where: { id },
            include: {
                client: true,
                product: true,
                payments: true,
            },
        })
        if (!sale) throw new NotFoundException('Sale not found')
        return sale
    }

    async update(id: string, dto: UpdateSaleDto) {
        const sale = await this.findOne(id)
        const quantity = dto.quantity ?? sale.quantity
        const unitPrice = dto.unitPrice ?? Number(sale.unitPrice)
        const productionCost =
            dto.productionCost ?? Number(sale.productionCost ?? 0)
        const totalAmount = quantity * Number(unitPrice)

        // totalPaid remains from existing payments
        const payments = await this.prisma.payment.findMany({
            where: { saleId: id },
        })
        const totalPaid = payments.reduce((sum, p) => sum + Number(p.amount), 0)
        const remaining = totalAmount - totalPaid
        const profit = totalAmount - productionCost
        const paymentStatus = this.calcPaymentStatus(totalPaid, totalAmount)

        return this.prisma.sale.update({
            where: { id },
            data: {
                saleDate: dto.saleDate ? new Date(dto.saleDate) : sale.saleDate,
                pickupDate: dto.pickupDate
                    ? new Date(dto.pickupDate)
                    : sale.pickupDate,
                quantity,
                unitPrice: this.toDecimal(unitPrice),
                currency: dto.currency ?? sale.currency,
                totalAmount: this.toDecimal(totalAmount),
                productionCost: dto.productionCost
                    ? this.toDecimal(productionCost)
                    : sale.productionCost,
                profit: this.toDecimal(profit),
                totalPaid: this.toDecimal(totalPaid),
                remainingAmount: this.toDecimal(Math.max(remaining, 0)),
                paymentStatus,
                paymentMethod: dto.paymentMethod ?? sale.paymentMethod,
                status: dto.status ?? sale.status,
                notes: dto.notes ?? sale.notes,
            },
        })
    }

    async addPayment(saleId: string, dto: CreatePaymentDto) {
        await this.findOne(saleId)
        await this.prisma.payment.create({
            data: {
                saleId,
                amount: this.toDecimal(dto.amount),
                currency: dto.currency,
                paymentMethod: dto.paymentMethod,
                paidAt: new Date(dto.paidAt),
                note: dto.note,
            },
        })
        return this.recalculate(saleId)
    }

    private async recalculate(saleId: string) {
        const sale = await this.prisma.sale.findUnique({
            where: { id: saleId },
        })
        if (!sale) throw new NotFoundException('Sale not found')
        const payments = await this.prisma.payment.findMany({
            where: { saleId },
        })
        const totalPaid = payments.reduce((sum, p) => sum + Number(p.amount), 0)
        const totalAmount = Number(sale.totalAmount)
        const productionCost = Number(sale.productionCost ?? 0)
        const remaining = totalAmount - totalPaid
        const profit = totalAmount - productionCost
        const paymentStatus = this.calcPaymentStatus(totalPaid, totalAmount)

        return this.prisma.sale.update({
            where: { id: saleId },
            data: {
                totalPaid: this.toDecimal(totalPaid),
                remainingAmount: this.toDecimal(Math.max(remaining, 0)),
                profit: this.toDecimal(profit),
                paymentStatus,
            },
            include: {
                client: true,
                product: true,
                payments: true,
            },
        })
    }

    async statsSummary() {
        const sales = await this.prisma.sale.findMany()
        const totalSalesAmount = sales.reduce(
            (s, v) => s + Number(v.totalAmount),
            0
        )
        const totalPaidAmount = sales.reduce(
            (s, v) => s + Number(v.totalPaid),
            0
        )
        const totalOutstandingAmount = sales.reduce(
            (s, v) => s + Number(v.remainingAmount),
            0
        )
        const totalProfit = sales.reduce((s, v) => s + Number(v.profit), 0)

        // Simple timeseries: last 30 days
        const from = new Date()
        from.setDate(from.getDate() - 30)
        const timeseriesRaw = await this.prisma.sale.groupBy({
            by: ['saleDate'],
            where: { saleDate: { gte: from } },
            _sum: { totalAmount: true },
        })
        const timeseries = timeseriesRaw.map((r) => ({
            date: r.saleDate.toISOString().slice(0, 10),
            total: Number(r._sum.totalAmount ?? 0),
        }))

        return {
            totalSalesAmount,
            totalPaidAmount,
            totalOutstandingAmount,
            totalProfit,
            timeseries,
        }
    }

    async monthlyStats(year?: string) {
        const sales = await this.prisma.sale.findMany({
            orderBy: { saleDate: 'asc' },
        })

        const availableYears = Array.from(
            new Set(
                sales.map((s) => new Date(s.saleDate).getFullYear().toString())
            )
        ).sort()

        const targetYear = year && year !== 'all' ? Number(year) : null
        const filtered = targetYear
            ? sales.filter(
                  (s) => new Date(s.saleDate).getFullYear() === targetYear
              )
            : sales

        const months = Array.from({ length: 12 }, (_, i) => ({
            month: i + 1,
            total: 0,
            paid: 0,
            profit: 0,
        }))

        filtered.forEach((s) => {
            const m = new Date(s.saleDate).getMonth() // 0-based
            months[m].total += Number(s.totalAmount ?? 0)
            months[m].paid += Number(s.totalPaid ?? 0)
            months[m].profit += Number(s.profit ?? 0)
        })

        return {
            year: targetYear ?? 'all',
            availableYears,
            months,
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async importRows(rows: Array<Record<string, unknown>>) {
        const { collection, category } = await this.ensureDefaultGroups()
        let created = 0
        const errors: { row: number; message: string }[] = []

        for (let i = 0; i < rows.length; i++) {
            const row = rows[i]
            try {
                const clientNameRaw =
                    row.customerName || row.customer || row.name || ''
                const productRaw = row.product || row.productName || ''
                const statusText = (row.status || '')
                    .toString()
                    .trim()
                    .toLowerCase()

                // ignore rows that are entirely empty or all numeric zeros
                const numericSignals = [
                    'total',
                    'totalAmount',
                    'unitPrice',
                    'qty',
                    'quantity',
                    'prePayment',
                    'prepay',
                    'deposit',
                ].map((k) => row[k] as string | number | undefined)
                const hasNonZeroNumeric = numericSignals.some((v) => {
                    if (v === undefined || v === null) return false
                    return this.parseNumber(v) !== 0
                })
                const hasText = [clientNameRaw, productRaw].some(
                    (v) => v && String(v).trim() !== ''
                )
                if (!hasNonZeroNumeric && !hasText) continue

                const saleDate =
                    typeof row.date === 'string' || typeof row.date === 'number'
                        ? new Date(row.date)
                        : null
                const pickupDate =
                    typeof row.pickupDate === 'string' ||
                    typeof row.pickupDate === 'number'
                        ? new Date(row.pickupDate)
                        : null
                if (!saleDate || Number.isNaN(saleDate.getTime())) {
                    errors.push({
                        row: i + 1,
                        message: 'Invalid or missing date',
                    })
                    continue
                }
                const pickupValid =
                    pickupDate && !Number.isNaN(pickupDate.getTime())
                        ? pickupDate
                        : null

                const clientName = this.pascalCase(
                    (clientNameRaw as string) || 'Unknown'
                )
                const existingClient = await this.prisma.client.findFirst({
                    where: {
                        fullName: { equals: clientName, mode: 'insensitive' },
                    },
                })
                const client =
                    existingClient ||
                    (await this.prisma.client.create({
                        data: { fullName: clientName, phone: 'N/A' },
                    }))

                let qty = this.parseNumber(
                    (row.qty ?? row.quantity) as string | number | undefined
                )
                if (!qty || qty <= 0) qty = 1
                let unitPrice = this.parseNumber(
                    (row.unitPrice ?? row.price) as string | number | undefined
                )
                let totalAmount = this.parseNumber(
                    (row.total ?? row.totalAmount) as
                        | string
                        | number
                        | undefined
                )
                if (!totalAmount || totalAmount <= 0) {
                    totalAmount = qty * (unitPrice || 0)
                }
                if (
                    (!unitPrice || unitPrice <= 0) &&
                    qty > 0 &&
                    totalAmount > 0
                ) {
                    unitPrice = totalAmount / qty
                }
                if (!totalAmount || totalAmount <= 0) {
                    errors.push({ row: i + 1, message: 'Missing total/price' })
                    continue
                }

                const prePayment = this.parseNumber(
                    (row.prePayment ?? row.prepay ?? row.deposit) as
                        | string
                        | number
                        | undefined
                )
                const productionCost = this.parseNumber(
                    (row.productionCost ?? 0) as string | number | undefined
                )
                const remainingProvided =
                    row.remainingAmount !== undefined &&
                    row.remainingAmount !== ''
                let remainingAmount = remainingProvided
                    ? this.parseNumber(
                          row.remainingAmount as string | number | undefined
                      )
                    : totalAmount - prePayment
                let totalPaid = prePayment
                if (statusText.includes('full')) {
                    totalPaid = totalAmount
                    remainingAmount = 0
                } else if (statusText.includes('partial')) {
                    totalPaid = remainingProvided
                        ? totalAmount - remainingAmount
                        : prePayment
                } else if (remainingProvided) {
                    totalPaid = totalAmount - remainingAmount
                }
                if (totalPaid < 0) totalPaid = 0
                if (totalPaid > totalAmount) totalPaid = totalAmount
                if (
                    remainingAmount === undefined ||
                    remainingAmount === null ||
                    Number.isNaN(remainingAmount)
                ) {
                    remainingAmount = totalAmount - totalPaid
                }
                if (remainingAmount < 0) remainingAmount = 0
                const profit =
                    row.profit !== undefined
                        ? this.parseNumber(
                              row.profit as string | number | undefined
                          )
                        : totalAmount - productionCost
                const paymentStatus = this.calcPaymentStatus(
                    totalPaid,
                    totalAmount
                )

                const paymentMethod = this.mapPaymentMethod(
                    (row.paymentMethod || '') as string
                )

                const productTitle =
                    (productRaw as string) || 'Imported Product'
                const productId = await this.ensureProduct(
                    this.pascalCase(productTitle),
                    unitPrice,
                    category.id,
                    collection.id
                )

                const sale = await this.prisma.sale.create({
                    data: {
                        clientId: client.id,
                        productId,
                        saleDate,
                        pickupDate: pickupValid,
                        quantity: qty,
                        unitPrice: this.toDecimal(unitPrice),
                        currency: Currency.RWF,
                        totalAmount: this.toDecimal(totalAmount),
                        prePaymentAmount: this.toDecimal(prePayment),
                        totalPaid: this.toDecimal(totalPaid),
                        remainingAmount: this.toDecimal(
                            Math.max(remainingAmount, 0)
                        ),
                        productionCost: this.toDecimal(productionCost),
                        profit: this.toDecimal(profit),
                        paymentStatus,
                        paymentMethod,
                        status: SaleStatus.ACTIVE,
                        notes:
                            (row.notes as string | null | undefined) ??
                            undefined,
                    },
                })

                if (totalPaid > 0) {
                    await this.prisma.payment.create({
                        data: {
                            saleId: sale.id,
                            amount: this.toDecimal(totalPaid),
                            currency: Currency.RWF,
                            paymentMethod,
                            paidAt: saleDate,
                            note: 'Imported payment',
                        },
                    })
                }
                created += 1
            } catch (err) {
                errors.push({
                    row: i + 1,
                    message:
                        err instanceof Error
                            ? err.message
                            : 'Failed to import row',
                })
            }
        }

        return { created, errors }
    }
}
