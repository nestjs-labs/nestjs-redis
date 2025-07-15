import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('hello')
  async getHello() {
    return await this.appService.getHello();
  }

  @Get('redis-info')
  async getRedisInfo() {
    return await this.appService.getRedisInfo();
  }

  @Post('set-key')
  async setKey(@Body() body: { key: string; value: string }) {
    const { key, value } = body;
    return await this.appService.setKey(key, value);
  }

  @Get('get-key')
  async getKey(@Query('key') key: string) {
    return await this.appService.getKey(key);
  }
}
