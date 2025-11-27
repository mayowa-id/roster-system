import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Timeslot } from './entities/timeslot.entity';
import { TimeslotService } from './timeslot.service';
import { TimeslotResolver } from './timeslot.resolver';

@Module({
  imports: [TypeOrmModule.forFeature([Timeslot])],
  providers: [TimeslotService, TimeslotResolver],
  exports: [TimeslotService],
})
export class TimeslotModule {}