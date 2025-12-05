import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  home() {
    return {
      name: 'Prime Couture API',
      status: 'ok',
      docs: '/docs',
    };
  }
}
