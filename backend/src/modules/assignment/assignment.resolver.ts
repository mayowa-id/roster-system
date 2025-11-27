import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { AssignmentService } from './assignment.service';
import { Assignment } from './entities/assignment.entity';
import {
  CreateAssignmentInput,
  MarkUnavailableInput,
  FilterAssignmentInput,
} from './dto/assignment.input';

@Resolver(() => Assignment)
export class AssignmentResolver {
  constructor(private readonly assignmentService: AssignmentService) {}

  @Mutation(() => Assignment, {
    description: 'Assign a user to a shift',
  })
  async assignUserToShift(
    @Args('input') createAssignmentInput: CreateAssignmentInput,
  ): Promise<Assignment> {
    return await this.assignmentService.create(createAssignmentInput);
  }

  @Query(() => [Assignment], {
    name: 'assignments',
    description: 'Get all assignments with optional filters',
  })
  async findAll(
    @Args('filter', { nullable: true }) filter?: FilterAssignmentInput,
  ): Promise<Assignment[]> {
    return await this.assignmentService.findAll(filter);
  }

  @Query(() => Assignment, {
    name: 'assignment',
    description: 'Get an assignment by ID',
  })
  async findOne(@Args('id') id: string): Promise<Assignment> {
    return await this.assignmentService.findOne(id);
  }

  @Query(() => [Assignment], {
    name: 'myAssignments',
    description: 'Get assignments for a specific user with optional date range',
  })
  async findMyAssignments(
    @Args('userId') userId: string,
    @Args('startDate', { nullable: true }) startDate?: string,
    @Args('endDate', { nullable: true }) endDate?: string,
  ): Promise<Assignment[]> {
    return await this.assignmentService.findMyAssignments(
      userId,
      startDate,
      endDate,
    );
  }

  @Query(() => [Assignment], {
    name: 'myAssignmentsForDay',
    description: 'Get assignments for a user on a specific day',
  })
  async findMyAssignmentsForDay(
    @Args('userId') userId: string,
    @Args('date') date: string,
  ): Promise<Assignment[]> {
    return await this.assignmentService.findMyAssignmentsForDay(userId, date);
  }

  @Query(() => [Assignment], {
    name: 'myAssignmentsForWeek',
    description: 'Get assignments for a user for a week starting from a date',
  })
  async findMyAssignmentsForWeek(
    @Args('userId') userId: string,
    @Args('startDate') startDate: string,
  ): Promise<Assignment[]> {
    return await this.assignmentService.findMyAssignmentsForWeek(
      userId,
      startDate,
    );
  }

  @Mutation(() => Boolean, {
    description: 'Remove an assignment',
  })
  async removeAssignment(@Args('id') id: string): Promise<boolean> {
    return await this.assignmentService.remove(id);
  }

  @Mutation(() => Assignment, {
    description: 'Mark a shift as unavailable with a reason',
  })
  async markShiftUnavailable(
    @Args('input') markUnavailableInput: MarkUnavailableInput,
  ): Promise<Assignment> {
    return await this.assignmentService.markUnavailable(markUnavailableInput);
  }

  @Mutation(() => Assignment, {
    description: 'Pick up an open shift',
  })
  async pickUpOpenShift(
    @Args('shiftId') shiftId: string,
    @Args('userId') userId: string,
  ): Promise<Assignment> {
    return await this.assignmentService.pickUpOpenShift(shiftId, userId);
  }
}