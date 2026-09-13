import { DrizzleModule } from '@infra/database/drizzle/drizzle.module';
import { Module } from '@nestjs/common';

@Module({
  imports: [DrizzleModule],
  exports: [DrizzleModule],
})
export class DatabaseModule {}
