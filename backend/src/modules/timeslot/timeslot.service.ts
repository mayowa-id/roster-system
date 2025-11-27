import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Timeslot } from './entities/timeslot.entity';
import { CreateTimeslotInput } from './dto/timeslot.input';

@Injectable()
export class TimeslotService {
  constructor(
    @InjectRepository(Timeslot)
    private readonly timeslotRepository: Repository<Timeslot>,
  ) {}

  async create(createTimeslotInput: CreateTimeslotInput): Promise<Timeslot> {
    const start = this.parseTime(createTimeslotInput.startTime);
    const end = this.parseTime(createTimeslotInput.endTime);

    if (start >= end) {
      throw new BadRequestException('Start time must be before end time');
    }

    const timeslot = this.timeslotRepository.create(createTimeslotInput);
    return await this.timeslotRepository.save(timeslot);
  }

  async findAll(): Promise<Timeslot[]> {
    return await this.timeslotRepository.find({
      order: { startTime: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Timeslot> {
    const timeslot = await this.timeslotRepository.findOne({
      where: { id },
      relations: ['shifts'],
    });

    if (!timeslot) {
      throw new NotFoundException(`Timeslot with ID ${id} not found`);
    }

    return timeslot;
  }

  private parseTime(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }
}