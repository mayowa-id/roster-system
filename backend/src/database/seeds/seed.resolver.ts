import { Resolver, Mutation } from '@nestjs/graphql';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { User, UserRole } from '../../modules/user/entities/user.entity';
import { Timeslot } from '../../modules/timeslot/entities/timeslot.entity';
import { Shift, ShiftStatus } from '../../modules/shift/entities/shift.entity';
import { Assignment, AssignmentStatus } from '../../modules/assignment/entities/assignment.entity';

@Resolver()
export class SeedResolver {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  @Mutation(() => String, { description: 'Seed the database with initial data' })
  async seedDatabase(): Promise<string> {
    const userRepo = this.dataSource.getRepository(User);
    const timeslotRepo = this.dataSource.getRepository(Timeslot);
    const shiftRepo = this.dataSource.getRepository(Shift);
    const assignmentRepo = this.dataSource.getRepository(Assignment);

    try {
      // Clear existing data
      await assignmentRepo.delete({});
      await shiftRepo.delete({});
      await timeslotRepo.delete({});
      await userRepo.delete({});

      // Create Users
      const users = await userRepo.save([
        {
          email: 'admin@roster.com',
          firstName: 'Admin',
          lastName: 'User',
          role: UserRole.ADMIN,
        },
        {
          email: 'john.doe@roster.com',
          firstName: 'John',
          lastName: 'Doe',
          role: UserRole.USER,
        },
        {
          email: 'jane.smith@roster.com',
          firstName: 'Jane',
          lastName: 'Smith',
          role: UserRole.USER,
        },
        {
          email: 'bob.johnson@roster.com',
          firstName: 'Bob',
          lastName: 'Johnson',
          role: UserRole.USER,
        },
        {
          email: 'alice.williams@roster.com',
          firstName: 'Alice',
          lastName: 'Williams',
          role: UserRole.USER,
        },
        {
          email: 'charlie.brown@roster.com',
          firstName: 'Charlie',
          lastName: 'Brown',
          role: UserRole.USER,
        },
        {
          email: 'diana.davis@roster.com',
          firstName: 'Diana',
          lastName: 'Davis',
          role: UserRole.USER,
        },
        {
          email: 'evan.wilson@roster.com',
          firstName: 'Evan',
          lastName: 'Wilson',
          role: UserRole.USER,
        },
      ]);

      // Create Timeslots
      const timeslots = await timeslotRepo.save([
        {
          name: 'Morning Shift',
          startTime: '08:00',
          endTime: '16:00',
        },
        {
          name: 'Evening Shift',
          startTime: '16:00',
          endTime: '00:00',
        },
        {
          name: 'Night Shift',
          startTime: '00:00',
          endTime: '08:00',
        },
        {
          name: 'Early Morning',
          startTime: '06:00',
          endTime: '14:00',
        },
      ]);

      // Create Shifts for the next 3 weeks
      const shifts: Shift[] = [];
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      for (let day = 0; day < 21; day++) {
        const shiftDate = new Date(today);
        shiftDate.setDate(today.getDate() + day);
        const dateString = shiftDate.toISOString().split('T')[0];

        const shiftsPerDay = Math.floor(Math.random() * 2) + 2;
        const selectedTimeslots = timeslots
          .sort(() => Math.random() - 0.5)
          .slice(0, shiftsPerDay);

        for (const timeslot of selectedTimeslots) {
          const shift = await shiftRepo.save({
            date: dateString,
            timeslotId: timeslot.id,
            status: ShiftStatus.OPEN,
            requiredStaff: Math.floor(Math.random() * 2) + 1,
          });
          shifts.push(shift);
        }
      }

      // Create Assignments
      const regularUsers = users.filter((u) => u.role === UserRole.USER);
      const shiftsToAssign = shifts.slice(0, Math.floor(shifts.length * 0.6));

      for (const shift of shiftsToAssign) {
        const assignedCount = Math.min(
          shift.requiredStaff,
          Math.floor(Math.random() * (shift.requiredStaff + 1)),
        );

        const availableUsers = [...regularUsers].sort(() => Math.random() - 0.5);

        for (let i = 0; i < assignedCount; i++) {
          const user = availableUsers[i];
          if (user) {
            await assignmentRepo.save({
              shiftId: shift.id,
              userId: user.id,
              status: AssignmentStatus.ASSIGNED,
            });
          }
        }

        if (assignedCount >= shift.requiredStaff) {
          shift.status = ShiftStatus.ASSIGNED;
          await shiftRepo.save(shift);
        }
      }

      return ` Database seeded successfully! Created ${users.length} users, ${timeslots.length} timeslots, ${shifts.length} shifts, and assignments.`;
    } catch (error) {
      return `Error seeding database: ${error.message}`;
    }
  }
}