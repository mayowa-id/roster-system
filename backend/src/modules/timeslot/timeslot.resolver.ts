import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { TimeslotService } from './timeslot.service';
import { Timeslot } from './entities/timeslot.entity';
import { CreateTimeslotInput } from './dto/timeslot.input';

@Resolver(() => Timeslot)
export class TimeslotResolver {
  constructor(private readonly timeslotService: TimeslotService) {}

  @Mutation(() => Timeslot, { description: 'Create a new timeslot' })
  async createTimeslot(
    @Args('input') createTimeslotInput: CreateTimeslotInput,
  ): Promise<Timeslot> {
    return await this.timeslotService.create(createTimeslotInput);
  }

  @Query(() => [Timeslot], { name: 'timeslots', description: 'Get all timeslots' })
  async findAll(): Promise<Timeslot[]> {
    return await this.timeslotService.findAll();
  }

  @Query(() => Timeslot, { name: 'timeslot', description: 'Get a timeslot by ID' })
  async findOne(@Args('id') id: string): Promise<Timeslot> {
    return await this.timeslotService.findOne(id);
  }
}