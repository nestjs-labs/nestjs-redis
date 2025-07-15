import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RedisModule } from '@nestjs-labs/nestjs-redis';

import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ConfigModule.forRoot(),

    // use root
    // RedisModule.forRoot({
    //   readonly: false,
    //   url: 'redis://localhost:6379',
    // }),

    // use factory
    RedisModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const url: string = configService.get('REDIS_URL')!;
        console.log(url);
        return {
          url,
          isGlobal: true,
        };
      },
      inject: [ConfigService],
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
