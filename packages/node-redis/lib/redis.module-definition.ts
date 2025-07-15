import { ConfigurableModuleBuilder } from '@nestjs/common';

import { RedisOptionsFactory } from './interfaces/redis-factory.interface';
import { RedisOptions } from './interfaces/redis-options.interface';

export const { ConfigurableModuleClass, MODULE_OPTIONS_TOKEN, OPTIONS_TYPE, ASYNC_OPTIONS_TYPE } =
  new ConfigurableModuleBuilder<RedisOptions>({
    moduleName: 'RedisModule'
  })
    .setClassMethodName('forRoot')
    .setExtras(
      {
        isGlobal: true
      },
      (definition, extras) => ({
        ...definition,
        global: extras.isGlobal
      })
    )
    .setFactoryMethodName('createRedisOptions' as keyof RedisOptionsFactory<RedisOptions>)
    .build();
