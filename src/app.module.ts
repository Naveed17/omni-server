import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { LicenseModule } from './license/license.module';
import { PosController } from './pos/pos.controller';
import { KhataController } from './khata/khata.controller';
import { ProductsController, CategoriesController, BusinessProfilesController } from './pos/products.controller';
import { OrdersController, RefundsController } from './pos/orders.controller';
import {
  StockController,
  ExpensesController,
  KitchenController,
  ReportsController,
  DatabaseWipeController,
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
    BusinessProfilesController,
    OrdersController,
    RefundsController,
    StockController,
    ExpensesController,
    KitchenController,
    ReportsController,
    DatabaseWipeController,
  ],
})
export class AppModule {}
