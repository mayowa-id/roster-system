import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Assignment } from './entities/assignment.entity';
import { Shift } from '../shift/entities/shift.entity';
import { AssignmentService } from './assignment.service';
import { AssignmentResolver } from './assignment.resolver';

@Module({
  imports: [TypeOrmModule.forFeature([Assignment, Shift])],
  providers: [AssignmentService, AssignmentResolver],
  exports: [AssignmentService],
})
export class AssignmentModule {}
