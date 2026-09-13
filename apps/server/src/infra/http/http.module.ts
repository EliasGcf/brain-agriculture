import { Module } from '@nestjs/common';

import { AppController } from './controllers/app.controller';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [AppController],
})
export class HttpModule {}
