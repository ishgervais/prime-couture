import { Module } from '@nestjs/common'
import { SalesService } from './sales.service'
import { SalesController } from './sales.controller'
import { ClientsModule } from '../clients/clients.module'

@Module({
    imports: [ClientsModule],
    providers: [SalesService],
    controllers: [SalesController],
})
export class SalesModule {}
