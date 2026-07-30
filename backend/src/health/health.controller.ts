import { Controller, Get } from '@nestjs/common';

export interface LiveHealthResponse {
  status: 'ok';
  timestamp: string;
}

@Controller('health')
export class HealthController {
  @Get('live')
  getLive(): LiveHealthResponse {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }
}
