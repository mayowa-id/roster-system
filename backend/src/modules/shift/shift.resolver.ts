import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { ShiftService } from './shift.service';
import { Shift } from './entities/shift.entity';
import {
  CreateShiftInput,
  UpdateShiftInput,
  FilterShiftInput,
  RepeatShiftInput,
} from './dto/shift.input';

@Resolver(() => Shift)
export class ShiftResolver {
  constructor(private readonly shiftService: ShiftService) {}

  @Mutation(() => Shift, { description: 'Create a new shift' })
  async createShift(
    @Args('input') createShiftInput: CreateShiftInput,
  ): Promise<Shift> {
    return await this.shiftService.create(createShiftInput);
  }

  @Query(() => [Shift], { name: 'shifts', description: 'Get all shifts with optional filters' })
  async findAll(
    @Args('filter', { nullable: true }) filter?: FilterShiftInput,
  ): Promise<Shift[]> {
    return await this.shiftService.findAll(filter);
  }

  @Query(() => Shift, { name: 'shift', description: 'Get a shift by ID' })
  async findOne(@Args('id') id: string): Promise<Shift> {
    return await this.shiftService.findOne(id);
  }

  @Query(() => [Shift], { name: 'openShifts', description: 'Get all open shifts' })
  async findOpenShifts(
    @Args('date', { nullable: true }) date?: string,
  ): Promise<Shift[]> {
    return await this.shiftService.findOpenShifts(date);
  }

  @Query(() => [Shift], {
    name: 'shiftsForDateRange',
    description: 'Get shifts for a date range',
  })
  async findByDateRange(
    @Args('startDate') startDate: string,
    @Args('endDate') endDate: string,
  ): Promise<Shift[]> {
    return await this.shiftService.findByDateRange(startDate, endDate);
  }

  @Mutation(() => Shift, { description: 'Update a shift' })
  async updateShift(
    @Args('id') id: string,
    @Args('input') updateShiftInput: UpdateShiftInput,
  ): Promise<Shift> {
    return await this.shiftService.update(id, updateShiftInput);
  }

  @Mutation(() => Boolean, { description: 'Delete a shift' })
  async deleteShift(@Args('id') id: string): Promise<boolean> {
    return await this.shiftService.remove(id);
  }

  @Mutation(() => [Shift], {
    description: 'Repeat a shift for multiple dates',
  })
  async repeatShift(
    @Args('input') repeatShiftInput: RepeatShiftInput,
  ): Promise<Shift[]> {
    return await this.shiftService.repeatShift(repeatShiftInput);
  }
}