import { ClusterService } from '@/index.js';
import { Controller, Get } from '@nestjs/common';

@Controller('inject')
export class InjectController {
  constructor(private readonly clusterService: ClusterService) {}

  @Get()
  async ping() {
    const resp_0 = await this.clusterService.getOrThrow().ping();
    const resp_1 = await this.clusterService.getOrThrow('client1').ping();

    return [resp_0, resp_1];
  }
}
