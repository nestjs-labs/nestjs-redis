import { Test, TestingModule } from '@nestjs/testing';
import { RedisModule } from './redis.module';
import { RedisService } from './redis.service';

describe('RedisService', () => {
  let module: TestingModule;
  let redisService: RedisService;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [
        RedisModule.forRoot({
          url: 'redis://localhost:6379'
        })
      ]
    }).compile();

    redisService = module.get<RedisService>(RedisService);
  });

  afterEach(async () => {
    await module.close();
  });

  it('should be defined', () => {
    expect(redisService).toBeDefined();
  });

  it('should get client', () => {
    const client = redisService.getClient();
    expect(client).toBeDefined();
  });
});
