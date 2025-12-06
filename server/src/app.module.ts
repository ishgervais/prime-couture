import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler'
import { APP_GUARD } from '@nestjs/core'
import { AuthModule } from './auth/auth.module'
import { CollectionsModule } from './collections/collections.module'
import { CategoriesModule } from './categories/categories.module'
import { ProductsModule } from './products/products.module'
import { OrdersModule } from './orders/orders.module'
import { AnalyticsModule } from './analytics/analytics.module'
import { FilesModule } from './files/files.module'
import { AppController } from './app.controller'
import { ClientsModule } from './clients/clients.module'
import { SalesModule } from './sales/sales.module'
import { ExpensesModule } from './expenses/expenses.module'

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        ThrottlerModule.forRoot([{ ttl: 60, limit: 120 }]),
        AuthModule,
        CollectionsModule,
        CategoriesModule,
        ProductsModule,
        OrdersModule,
        AnalyticsModule,
        FilesModule,
        ClientsModule,
        SalesModule,
        ExpensesModule,
    ],
    controllers: [AppController],
    providers: [
        {
            provide: APP_GUARD,
            useClass: ThrottlerGuard,
        },
    ],
})
export class AppModule {}
