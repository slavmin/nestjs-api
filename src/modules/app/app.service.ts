import { Injectable } from '@nestjs/common';
import { ConfigService } from '../config';

@Injectable()
export class AppService {
  constructor(private readonly config: ConfigService) {}

  getHello(): string {
    return 'Hello World!';
  }
}
