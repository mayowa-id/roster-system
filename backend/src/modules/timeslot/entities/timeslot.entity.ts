import { ObjectType, Field, ID } from '@nestjs/graphql';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Shift } from '../../shift/entities/shift.entity';

@Entity('timeslots')
@ObjectType()
export class Timeslot {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => ID)
  id: string;

  @Column()
  @Field()
  name: string;

  @Column({ type: 'time' })
  @Field()
  startTime: string;

  @Column({ type: 'time' })
  @Field()
  endTime: string;

  @OneToMany(() => Shift, (shift) => shift.timeslot)
  @Field(() => [Shift], { nullable: true })
  shifts?: Shift[];

  @CreateDateColumn()
  @Field()
  createdAt: Date;

  @UpdateDateColumn()
  @Field()
  updatedAt: Date;
}