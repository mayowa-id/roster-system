import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { User, UserRole } from '../../modules/user/entities/user.entity';
import { Timeslot } from '../../modules/timeslot/entities/timeslot.entity';
import { Shift, ShiftStatus } from '../../modules/shift/entities/shift.entity';
import {
  Assignment,
  AssignmentStatus,
} from '../../modules/assignment/entities/assignment.entity';

// load .env
config();

// debug: show DB env that the script sees (password masked)
console.log('DB env:',
  process.env.DATABASE_HOST,
  process.env.DATABASE_PORT,
  process.env.DATABASE_USERNAME,
  process.env.DATABASE_PASSWORD ? '***(set)***' : undefined,
  process.env.DATABASE_NAME
);

const port = process.env.DATABASE_PORT ? parseInt(process.env.DATABASE_PORT, 10) : 5432;

const dataSource = new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST || 'localhost',
  port: Number.isInteger(port) ? port : 5432,
  username: process.env.DATABASE_USERNAME || 'postgres',
  password: process.env.DATABASE_PASSWORD || 'postgres',
  database: process.env.DATABASE_NAME || 'roster_system',
  entities: [User, Timeslot, Shift, Assignment],
  synchronize: true,
});

async function seed() {
  try {
    console.log('Initializing data source...');
    await dataSource.initialize();

    if (!dataSource.isInitialized) {
      console.error('Failed to initialize DataSource');
      process.exit(1);
    }

    console.log(' Starting database seed...');

    // Use explicit deletes (not clear/truncate) to avoid FK truncate errors.
    await dataSource.transaction(async (em) => {
      // Delete in dependency order: children first
      console.log('Clearing assignments...');
      await em.createQueryBuilder().delete().from(Assignment).execute();

      console.log('Clearing shifts...');
      await em.createQueryBuilder().delete().from(Shift).execute();

      console.log('Clearing timeslots...');
      await em.createQueryBuilder().delete().from(Timeslot).execute();

      console.log('Clearing users...');
      await em.createQueryBuilder().delete().from(User).execute();

      // Create Users
      console.log('Creating users...');
      const users = await em.getRepository(User).save([
        { email: 'admin@roster.com', firstName: 'Admin', lastName: 'User', role: UserRole.ADMIN },
        { email: 'john.doe@roster.com', firstName: 'John', lastName: 'Doe', role: UserRole.USER },
        { email: 'jane.smith@roster.com', firstName: 'Jane', lastName: 'Smith', role: UserRole.USER },
        { email: 'bob.johnson@roster.com', firstName: 'Bob', lastName: 'Johnson', role: UserRole.USER },
        { email: 'alice.williams@roster.com', firstName: 'Alice', lastName: 'Williams', role: UserRole.USER },
        { email: 'charlie.brown@roster.com', firstName: 'Charlie', lastName: 'Brown', role: UserRole.USER },
        { email: 'diana.davis@roster.com', firstName: 'Diana', lastName: 'Davis', role: UserRole.USER },
        { email: 'evan.wilson@roster.com', firstName: 'Evan', lastName: 'Wilson', role: UserRole.USER },
      ]);
      console.log(` Created ${users.length} users`);

      // Create Timeslots
      console.log('Creating timeslots...');
      const timeslots = await em.getRepository(Timeslot).save([
        { name: 'Morning Shift', startTime: '08:00', endTime: '16:00' },
        { name: 'Evening Shift', startTime: '16:00', endTime: '00:00' },
        { name: 'Night Shift', startTime: '00:00', endTime: '08:00' },
        { name: 'Early Morning', startTime: '06:00', endTime: '14:00' },
      ]);
      console.log(` Created ${timeslots.length} timeslots`);

      // Create Shifts for the next 3 weeks
      console.log('Creating shifts...');
      const shifts: Shift[] = [];
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      for (let day = 0; day < 21; day++) {
        const shiftDate = new Date(today);
        shiftDate.setDate(today.getDate() + day);
        const dateString = shiftDate.toISOString().split('T')[0];

        const shiftsPerDay = Math.floor(Math.random() * 2) + 2; // 2 or 3 shifts
        const selectedTimeslots = timeslots.sort(() => Math.random() - 0.5).slice(0, shiftsPerDay);

        for (const timeslot of selectedTimeslots) {
          const shift = await em.getRepository(Shift).save({
            date: dateString,
            timeslotId: timeslot.id,
            status: ShiftStatus.OPEN,
            requiredStaff: Math.floor(Math.random() * 2) + 1,
          });
          shifts.push(shift);
        }
      }
      console.log(`Created ${shifts.length} shifts`);

      // Create Assignments (assign some shifts, leave some open)
      console.log('Creating assignments...');
      const assignments: Assignment[] = [];
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
            const assignment = await em.getRepository(Assignment).save({
              shiftId: shift.id,
              userId: user.id,
              status: AssignmentStatus.ASSIGNED,
            });
            assignments.push(assignment);
          }
        }

        if (assignedCount >= shift.requiredStaff) {
          shift.status = ShiftStatus.ASSIGNED;
          await em.getRepository(Shift).save(shift);
        }
      }

      const assignmentsToMarkUnavailable = assignments
        .slice(0, Math.floor(assignments.length * 0.1))
        .filter((a) => {
          const shiftDate = new Date(a.shift?.date || '');
          return shiftDate > today;
        });

      for (const assignment of assignmentsToMarkUnavailable) {
        assignment.status = AssignmentStatus.UNAVAILABLE;
        assignment.unavailableReason = 'Personal emergency - cannot attend';
        assignment.markedUnavailableAt = new Date();
        await em.getRepository(Assignment).save(assignment);

        const shift = await em.getRepository(Shift).findOne({ where: { id: assignment.shiftId } });
        if (shift) {
          shift.status = ShiftStatus.OPEN;
          await em.getRepository(Shift).save(shift);
        }
      }

      console.log(` Created ${assignments.length} assignments`);
      console.log(` Marked ${assignmentsToMarkUnavailable.length} as unavailable`);

      // Summary
      console.log('Seed Summary:');
      console.log(`   Users: ${users.length} (1 admin, ${regularUsers.length} regular users)`);
      console.log(`   Timeslots: ${timeslots.length}`);
      console.log(`   Shifts: ${shifts.length}`);
      console.log(`   Assignments: ${assignments.length}`);
      console.log(`   Open Shifts: ${shifts.length - shiftsToAssign.length}`);
      console.log(`   Unavailable: ${assignmentsToMarkUnavailable.length}`);
    });

    console.log('Database seed completed successfully!');
    if (dataSource.isInitialized) {
      await dataSource.destroy();
    }
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    if (dataSource.isInitialized) {
      await dataSource.destroy();
    }
    process.exit(1);
  }
}

seed();
