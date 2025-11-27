import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Assignment, AssignmentStatus } from './entities/assignment.entity';
import { Shift, ShiftStatus } from '../shift/entities/shift.entity';
import {
  CreateAssignmentInput,
  MarkUnavailableInput,
  FilterAssignmentInput,
} from './dto/assignment.input';

@Injectable()
export class AssignmentService {
  constructor(
    @InjectRepository(Assignment)
    private readonly assignmentRepository: Repository<Assignment>,
    @InjectRepository(Shift)
    private readonly shiftRepository: Repository<Shift>,
  ) {}

  async create(createAssignmentInput: CreateAssignmentInput): Promise<Assignment> {
    const { shiftId, userId } = createAssignmentInput;

    const shift = await this.shiftRepository.findOne({
      where: { id: shiftId },
      relations: ['timeslot'],
    });

    if (!shift) {
      throw new NotFoundException(`Shift with ID ${shiftId} not found`);
    }

    const shiftDate = new Date(shift.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (shiftDate < today) {
      throw new BadRequestException('Cannot assign to a past shift');
    }

    const existingAssignment = await this.assignmentRepository.findOne({
      where: { shiftId, userId },
    });

    if (existingAssignment) {
      throw new ConflictException('User is already assigned to this shift');
    }

    const currentAssignments = await this.assignmentRepository.count({
      where: { 
        shiftId, 
        status: AssignmentStatus.ASSIGNED 
      },
    });

    if (currentAssignments >= shift.requiredStaff) {
      throw new BadRequestException('Shift is already at full capacity');
    }

    const assignment = this.assignmentRepository.create(createAssignmentInput);
    const savedAssignment = await this.assignmentRepository.save(assignment);

    if (currentAssignments + 1 >= shift.requiredStaff) {
      shift.status = ShiftStatus.ASSIGNED;
      await this.shiftRepository.save(shift);
    }

    return await this.findOne(savedAssignment.id);
  }

  async findAll(filter?: FilterAssignmentInput): Promise<Assignment[]> {
    const where: any = {};

    if (filter) {
      if (filter.userId) {
        where.userId = filter.userId;
      }

      if (filter.shiftId) {
        where.shiftId = filter.shiftId;
      }

      if (filter.status) {
        where.status = filter.status;
      }

      if (filter.date || filter.startDate || filter.endDate) {
        const assignments = await this.assignmentRepository
          .createQueryBuilder('assignment')
          .leftJoinAndSelect('assignment.shift', 'shift')
          .leftJoinAndSelect('shift.timeslot', 'timeslot')
          .leftJoinAndSelect('assignment.user', 'user')
          .where(where)
          .andWhere(
            filter.date
              ? 'shift.date = :date'
              : filter.startDate && filter.endDate
              ? 'shift.date BETWEEN :startDate AND :endDate'
              : filter.startDate
              ? 'shift.date >= :startDate'
              : 'shift.date <= :endDate',
            {
              date: filter.date,
              startDate: filter.startDate,
              endDate: filter.endDate,
            },
          )
          .orderBy('shift.date', 'ASC')
          .getMany();

        return assignments;
      }
    }

    return await this.assignmentRepository.find({
      where,
      relations: ['shift', 'shift.timeslot', 'user'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Assignment> {
    const assignment = await this.assignmentRepository.findOne({
      where: { id },
      relations: ['shift', 'shift.timeslot', 'user'],
    });

    if (!assignment) {
      throw new NotFoundException(`Assignment with ID ${id} not found`);
    }

    return assignment;
  }

  async findMyAssignments(
    userId: string,
    startDate?: string,
    endDate?: string,
  ): Promise<Assignment[]> {
    if (startDate && endDate) {
      return await this.assignmentRepository
        .createQueryBuilder('assignment')
        .leftJoinAndSelect('assignment.shift', 'shift')
        .leftJoinAndSelect('shift.timeslot', 'timeslot')
        .leftJoinAndSelect('assignment.user', 'user')
        .where('assignment.userId = :userId', { userId })
        .andWhere('shift.date BETWEEN :startDate AND :endDate', {
          startDate,
          endDate,
        })
        .orderBy('shift.date', 'ASC')
        .getMany();
    }

    return await this.assignmentRepository.find({
      where: { userId },
      relations: ['shift', 'shift.timeslot', 'user'],
      order: { createdAt: 'DESC' },
    });
  }

  async findMyAssignmentsForDay(userId: string, date: string): Promise<Assignment[]> {
    return await this.assignmentRepository
      .createQueryBuilder('assignment')
      .leftJoinAndSelect('assignment.shift', 'shift')
      .leftJoinAndSelect('shift.timeslot', 'timeslot')
      .leftJoinAndSelect('assignment.user', 'user')
      .where('assignment.userId = :userId', { userId })
      .andWhere('shift.date = :date', { date })
      .orderBy('timeslot.startTime', 'ASC')
      .getMany();
  }

  async findMyAssignmentsForWeek(
    userId: string,
    startDate: string,
  ): Promise<Assignment[]> {
    const start = new Date(startDate);
    const end = new Date(start);
    end.setDate(end.getDate() + 6);

    const endDate = end.toISOString().split('T')[0];

    return await this.findMyAssignments(userId, startDate, endDate);
  }

  async remove(id: string): Promise<boolean> {
    const assignment = await this.findOne(id);

    const shift = await this.shiftRepository.findOne({
      where: { id: assignment.shiftId },
    });

    await this.assignmentRepository.remove(assignment);

    if (shift && shift.status === ShiftStatus.ASSIGNED) {
      const remainingAssignments = await this.assignmentRepository.count({
        where: { 
          shiftId: shift.id, 
          status: AssignmentStatus.ASSIGNED 
        },
      });

      if (remainingAssignments < shift.requiredStaff) {
        shift.status = ShiftStatus.OPEN;
        await this.shiftRepository.save(shift);
      }
    }

    return true;
  }

  async markUnavailable(
    markUnavailableInput: MarkUnavailableInput,
  ): Promise<Assignment> {
    const { assignmentId, reason } = markUnavailableInput;

    const assignment = await this.findOne(assignmentId);

    if (assignment.status !== AssignmentStatus.ASSIGNED) {
      throw new BadRequestException(
        'Can only mark assigned shifts as unavailable',
      );
    }

    const shiftDate = new Date(assignment.shift.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (shiftDate < today) {
      throw new BadRequestException('Cannot mark past shifts as unavailable');
    }

    assignment.status = AssignmentStatus.UNAVAILABLE;
    assignment.unavailableReason = reason;
    assignment.markedUnavailableAt = new Date();

    const updatedAssignment = await this.assignmentRepository.save(assignment);

    const shift = await this.shiftRepository.findOne({
      where: { id: assignment.shiftId },
    });

    if (shift) {
      const assignedCount = await this.assignmentRepository.count({
        where: { 
          shiftId: shift.id, 
          status: AssignmentStatus.ASSIGNED 
        },
      });

      if (assignedCount < shift.requiredStaff) {
        shift.status = ShiftStatus.OPEN;
        await this.shiftRepository.save(shift);
      }
    }

    return await this.findOne(updatedAssignment.id);
  }

  async pickUpOpenShift(shiftId: string, userId: string): Promise<Assignment> {
    const shift = await this.shiftRepository.findOne({
      where: { id: shiftId },
    });

    if (!shift) {
      throw new NotFoundException(`Shift with ID ${shiftId} not found`);
    }

    if (shift.status !== ShiftStatus.OPEN) {
      throw new BadRequestException('This shift is not available for pickup');
    }

    return await this.create({
      shiftId,
      userId,
      status: AssignmentStatus.ASSIGNED,
    });
  }
}