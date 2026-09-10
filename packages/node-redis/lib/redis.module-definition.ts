import type { RedisOptions } from './interfaces/redis-options.interface';

import { ConfigurableModuleBuilder } from '@nestjs/common';

export const { ASYNC_OPTIONS_TYPE, ConfigurableModuleClass, MODULE_OPTIONS_TOKEN, OPTIONS_TYPE } =
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
    .setFactoryMethodName('createRedisOptions')
    .build();
