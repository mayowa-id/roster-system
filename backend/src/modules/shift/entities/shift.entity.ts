import { ObjectType, Field, ID, Int, registerEnumType } from '@nestjs/graphql';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Timeslot } from '../../timeslot/entities/timeslot.entity';
import { Assignment } from '../../assignment/entities/assignment.entity';

export enum ShiftStatus {
  OPEN = 'OPEN',
  ASSIGNED = 'ASSIGNED',
  CANCELLED = 'CANCELLED',
}

registerEnumType(ShiftStatus, {
  name: 'ShiftStatus',
  description: 'Status of a shift',
});

@Entity('shifts')
@ObjectType()
export class Shift {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => ID)
  id: string;

  @Column({ type: 'date' })
  @Field()
  date: string;

  @Column()
  timeslotId: string;

  @ManyToOne(() => Timeslot, (timeslot) => timeslot.shifts, { eager: true })
  @JoinColumn({ name: 'timeslotId' })
  @Field(() => Timeslot)
  timeslot: Timeslot;

  @Column({
    type: 'enum',
    enum: ShiftStatus,
    default: ShiftStatus.OPEN,
  })
  @Field(() => ShiftStatus)
  status: ShiftStatus;

  @Column({ default: 1 })
  @Field(() => Int)
  requiredStaff: number;

  @OneToMany(() => Assignment, (assignment) => assignment.shift)
  @Field(() => [Assignment], { nullable: true })
  assignments?: Assignment[];

  @CreateDateColumn()
  @Field()
  createdAt: Date;

  @UpdateDateColumn()
  @Field()
  updatedAt: Date;
}