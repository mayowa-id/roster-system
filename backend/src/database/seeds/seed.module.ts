import { Module } from '@nestjs/common';
import { SeedResolver } from './seed.resolver';

@Module({
  providers: [SeedResolver],
})
export class SeedModule {}