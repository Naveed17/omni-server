import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { LicenseModule } from './license/license.module';
import { BackupModule } from './backup/backup.module';
import { HealthController } from './health.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    LicenseModule,
    BackupModule,
  ],
  controllers: [
    HealthController,
  ],
})
export class AppModule {}
