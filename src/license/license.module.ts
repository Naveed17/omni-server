import { Module } from '@nestjs/common';
import { LicenseRepository } from './license.repository';
import { LicenseService } from './license.service';
import { LicenseController } from './license.controller';
import { AdminLicenseController } from './admin-license.controller';

@Module({
  controllers: [LicenseController, AdminLicenseController],
  providers: [LicenseRepository, LicenseService],
  exports: [LicenseService, LicenseRepository],
})
export class LicenseModule {}
