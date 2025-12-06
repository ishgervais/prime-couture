import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common'
import { ExpensesService } from './expenses.service'
import { CreateExpenseDto } from './dto/create-expense.dto'
import { CreateExpenseCategoryDto } from './dto/create-expense-category.dto'
import { ImportExpensesDto } from './dto/import-expenses.dto'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'

@UseGuards(JwtAuthGuard)
@Controller('admin')
export class ExpensesController {
  constructor(private readonly expenses: ExpensesService) {}

  @Get('expenses')
  list(
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
    @Query('search') search?: string,
    @Query('categoryId') categoryId?: string,
    @Query('year') year?: string,
    @Query('month') month?: string,
  ) {
    return this.expenses.list({
      page,
      pageSize,
      search,
      categoryId,
      year: year ? Number(year) : undefined,
      month: month ? Number(month) : undefined,
    })
  }

  @Post('expenses')
  create(@Body() dto: CreateExpenseDto) {
    return this.expenses.create(dto)
  }

  @Post('expenses/import')
  import(@Body() dto: ImportExpensesDto) {
    return this.expenses.importRows(dto)
  }

  @Get('expenses/stats/summary')
  summary(@Query('year') year?: string) {
    return this.expenses.summary(year ? Number(year) : undefined)
  }

  @Get('expenses/stats/monthly')
  monthly(@Query('year') year?: string) {
    return this.expenses.monthly(year ? Number(year) : undefined)
  }

  @Get('expense-categories')
  listCategories() {
    return this.expenses.listCategories()
  }

  @Post('expense-categories')
  createCategory(@Body() dto: CreateExpenseCategoryDto) {
    return this.expenses.createCategory(dto)
  }
}
