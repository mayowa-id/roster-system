import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Shift } from './entities/shift.entity';
import { ShiftService } from './shift.service';
import { ShiftResolver } from './shift.resolver';

@Module({
  imports: [TypeOrmModule.forFeature([Shift])],
  providers: [ShiftService, ShiftResolver],
  exports: [ShiftService],
})
export class ShiftModule {}