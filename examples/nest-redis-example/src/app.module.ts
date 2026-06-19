import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TerminusModule } from '@nestjs/terminus';

import { RedisModule } from '@nestjs-labs/nestjs-redis';
import { RedisHealthModule } from '@nestjs-labs/nestjs-redis-health';

import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  controllers: [AppController],
  imports: [
    ConfigModule.forRoot(),
    TerminusModule,
    RedisHealthModule,

    // use root
    // RedisModule.forRoot({
    //   readonly: false,
    //   url: 'redis://localhost:6379',
    // }),

    // use factory
    // RedisModule.forRootAsync({
    //   imports: [ConfigModule],
    //   useFactory: (configService: ConfigService) => {
    //     const url: string = configService.get('REDIS_URL')!;
    //     return {
    //       url,
    //       isGlobal: true,
    //     };
    //   },
    //   inject: [ConfigService],
    // }),

    // use factory
    RedisModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const _url: string = configService.get('REDIS_URL')!;

        return {
          cluster: {
            rootNodes: [
              {
                url: 'redis://127.0.0.1:16379',
              },
            ],
          },
          isGlobal: true,
        };
      },
    }),
  ],
  providers: [AppService],
})
export class AppModule {}
