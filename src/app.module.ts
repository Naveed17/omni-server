import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { LicenseModule } from './license/license.module';
import { PosController } from './pos/pos.controller';
import { KhataController } from './khata/khata.controller';
import { ProductsController, CategoriesController } from './pos/products.controller';
import { OrdersController } from './pos/orders.controller';
import {
  StockController,
  ExpensesController,
  KitchenController,
  ReportsController,
} from './pos/extra.controllers';
import { HealthController } from './health.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    LicenseModule,
  ],
  controllers: [
    HealthController,
    PosController,
    KhataController,
    ProductsController,
    CategoriesController,
    OrdersController,
    StockController,
    ExpensesController,
    KitchenController,
    ReportsController,
  ],
})
export class AppModule {}
