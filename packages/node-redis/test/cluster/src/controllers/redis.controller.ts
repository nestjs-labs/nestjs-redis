import { RedisService } from '@/index.js';
import { Controller, Get } from '@nestjs/common';

@Controller('redis')
export class RedisController {
  constructor(private readonly redisService: RedisService) {}

  @Get()
  async ping() {
    const client = this.redisService.getClient();

    return {
      clientType: this.redisService.getClientType(),
      ping: await client.ping()
    };
  }
}
