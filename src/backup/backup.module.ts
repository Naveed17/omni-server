import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { LicenseModule } from '../license/license.module';
import { BackupRepository } from './backup.repository';
import { BackupService } from './backup.service';
import { BackupController } from './backup.controller';
import { AdminBackupController } from './admin-backup.controller';

@Module({
  imports: [DatabaseModule, LicenseModule],
  controllers: [BackupController, AdminBackupController],
  providers: [BackupRepository, BackupService],
  exports: [BackupService, BackupRepository],
})
export class BackupModule {}
