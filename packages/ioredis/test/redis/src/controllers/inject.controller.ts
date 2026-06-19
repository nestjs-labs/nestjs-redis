import { RedisService } from '@/index.js';
import { Controller, Get } from '@nestjs/common';

@Controller('inject')
export class InjectController {
  constructor(private readonly redisService: RedisService) {}

  @Get()
  async ping() {
    const resp_0 = await this.redisService.getOrThrow().ping();
    const resp_1 = await this.redisService.getOrThrow('client1').ping();

    return [resp_0, resp_1];
  }
}
