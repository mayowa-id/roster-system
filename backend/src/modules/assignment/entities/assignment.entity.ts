import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Shift } from '../../shift/entities/shift.entity';

export enum AssignmentStatus {
  ASSIGNED = 'ASSIGNED',
  UNAVAILABLE = 'UNAVAILABLE',
  COMPLETED = 'COMPLETED',
}

registerEnumType(AssignmentStatus, {
  name: 'AssignmentStatus',
  description: 'Status of an assignment',
});

@Entity('assignments')
@ObjectType()
@Unique(['shiftId', 'userId']) // Prevent double assignment
export class Assignment {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => ID)
  id: string;

  @Column()
  shiftId: string;

  @ManyToOne(() => Shift, (shift) => shift.assignments, { eager: true })
  @JoinColumn({ name: 'shiftId' })
  @Field(() => Shift)
  shift: Shift;

  @Column({ nullable: true })
  userId: string;

  @ManyToOne(() => User, (user) => user.assignments, { eager: true, nullable: true })
  @JoinColumn({ name: 'userId' })
  @Field(() => User, { nullable: true })
  user?: User;

  @Column({
    type: 'enum',
    enum: AssignmentStatus,
    default: AssignmentStatus.ASSIGNED,
  })
  @Field(() => AssignmentStatus)
  status: AssignmentStatus;

  @Column({ type: 'text', nullable: true })
  @Field({ nullable: true })
  unavailableReason?: string;

  @Column({ type: 'timestamp', nullable: true })
  @Field({ nullable: true })
  markedUnavailableAt?: Date;

  @CreateDateColumn()
  @Field()
  createdAt: Date;

  @UpdateDateColumn()
  @Field()
  updatedAt: Date;
}