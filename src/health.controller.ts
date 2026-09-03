import { Controller, Get } from '@nestjs/common';

@Controller('api')
export class HealthController {
  @Get()
  getApiRoot() {
    return {
      success: true,
      message: 'server is running',
      timestamp: new Date().toISOString(),
    };
  }

  @Get('health')
  getHealth() {
    return {
      success: true,
      message: 'server is running',
      timestamp: new Date().toISOString(),
    };
  }
}
