import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { Shift, ShiftStatus } from './entities/shift.entity';
import {
  CreateShiftInput,
  UpdateShiftInput,
  FilterShiftInput,
  RepeatShiftInput,
} from './dto/shift.input';

@Injectable()
export class ShiftService {
  constructor(
    @InjectRepository(Shift)
    private readonly shiftRepository: Repository<Shift>,
  ) {}

  async create(createShiftInput: CreateShiftInput): Promise<Shift> {
    const shiftDate = new Date(createShiftInput.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (shiftDate < today) {
      throw new BadRequestException('Cannot create shifts in the past');
    }

    const shift = this.shiftRepository.create(createShiftInput);
    return await this.shiftRepository.save(shift);
  }

  async findAll(filter?: FilterShiftInput): Promise<Shift[]> {
    const where: any = {};

    if (filter) {
      if (filter.date) {
        where.date = filter.date;
      }

      if (filter.startDate && filter.endDate) {
        where.date = Between(filter.startDate, filter.endDate);
      } else if (filter.startDate) {
        where.date = MoreThanOrEqual(filter.startDate);
      } else if (filter.endDate) {
        where.date = LessThanOrEqual(filter.endDate);
      }

      if (filter.timeslotId) {
        where.timeslotId = filter.timeslotId;
      }

      if (filter.status) {
        where.status = filter.status;
      }
    }

    return await this.shiftRepository.find({
      where,
      relations: ['timeslot', 'assignments', 'assignments.user'],
      order: { date: 'ASC', createdAt: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Shift> {
    const shift = await this.shiftRepository.findOne({
      where: { id },
      relations: ['timeslot', 'assignments', 'assignments.user'],
    });

    if (!shift) {
      throw new NotFoundException(`Shift with ID ${id} not found`);
    }

    return shift;
  }

  async findOpenShifts(date?: string): Promise<Shift[]> {
    const where: any = { status: ShiftStatus.OPEN };

    if (date) {
      where.date = date;
    } else {
      const today = new Date().toISOString().split('T')[0];
      where.date = MoreThanOrEqual(today);
    }

    return await this.shiftRepository.find({
      where,
      relations: ['timeslot'],
      order: { date: 'ASC' },
    });
  }

  async findByDateRange(startDate: string, endDate: string): Promise<Shift[]> {
    return await this.shiftRepository.find({
      where: {
        date: Between(startDate, endDate),
      },
      relations: ['timeslot', 'assignments', 'assignments.user'],
      order: { date: 'ASC' },
    });
  }

  async update(id: string, updateShiftInput: UpdateShiftInput): Promise<Shift> {
    const shift = await this.findOne(id);

    if (updateShiftInput.date) {
      const shiftDate = new Date(updateShiftInput.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (shiftDate < today) {
        throw new BadRequestException('Cannot update to a past date');
      }
    }

    Object.assign(shift, updateShiftInput);
    return await this.shiftRepository.save(shift);
  }

  async remove(id: string): Promise<boolean> {
    const shift = await this.findOne(id);
    await this.shiftRepository.remove(shift);
    return true;
  }

  async repeatShift(repeatShiftInput: RepeatShiftInput): Promise<Shift[]> {
    const { timeslotId, dates, requiredStaff } = repeatShiftInput;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (const date of dates) {
      const shiftDate = new Date(date);
      if (shiftDate < today) {
        throw new BadRequestException(`Date ${date} is in the past`);
      }
    }

    const shifts: Shift[] = [];

    for (const date of dates) {
      const shift = this.shiftRepository.create({
        date,
        timeslotId,
        requiredStaff: requiredStaff || 1,
        status: ShiftStatus.OPEN,
      });

      const savedShift = await this.shiftRepository.save(shift);
      shifts.push(savedShift);
    }

    return shifts;
  }
}