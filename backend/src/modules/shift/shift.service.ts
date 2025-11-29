import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { Shift, ShiftStatus } from './entities/shift.entity';
import { CreateShiftInput, UpdateShiftInput, FilterShiftInput, RepeatShiftInput } from './dto/shift.input';

@Injectable()
export class ShiftService {
  constructor(
    @InjectRepository(Shift)
    private readonly shiftRepository: Repository<Shift>,
  ) {}

  async create(createShiftInput: CreateShiftInput): Promise<Shift> {
    const shiftDate = new Date(createShiftInput.date);
    const today = new Date(); today.setHours(0,0,0,0);
    if (shiftDate < today) throw new BadRequestException('Cannot create shifts in the past');

    const shift = this.shiftRepository.create(createShiftInput);
    const savedShift = await this.shiftRepository.save(shift);
    return Array.isArray(savedShift) ? savedShift[0] : savedShift;
  }
}
