import { InputType, Field, Int } from '@nestjs/graphql';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  Min,
  IsArray,
} from 'class-validator';
import { ShiftStatus } from '../entities/shift.entity';

@InputType()
export class CreateShiftInput {
  @Field()
  @IsDateString()
  @IsNotEmpty()
  date: string;

  @Field()
  @IsUUID()
  @IsNotEmpty()
  timeslotId: string;

  @Field(() => Int, { defaultValue: 1 })
  @IsInt()
  @Min(1)
  @IsOptional()
  requiredStaff?: number;

  @Field(() => ShiftStatus, { defaultValue: ShiftStatus.OPEN })
  @IsEnum(ShiftStatus)
  @IsOptional()
  status?: ShiftStatus;
}

@InputType()
export class UpdateShiftInput {
  @Field({ nullable: true })
  @IsDateString()
  @IsOptional()
  date?: string;

  @Field({ nullable: true })
  @IsUUID()
  @IsOptional()
  timeslotId?: string;

  @Field(() => Int, { nullable: true })
  @IsInt()
  @Min(1)
  @IsOptional()
  requiredStaff?: number;

  @Field(() => ShiftStatus, { nullable: true })
  @IsEnum(ShiftStatus)
  @IsOptional()
  status?: ShiftStatus;
}

@InputType()
export class FilterShiftInput {
  @Field({ nullable: true })
  @IsDateString()
  @IsOptional()
  date?: string;

  @Field({ nullable: true })
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @Field({ nullable: true })
  @IsDateString()
  @IsOptional()
  endDate?: string;

  @Field({ nullable: true })
  @IsUUID()
  @IsOptional()
  timeslotId?: string;

  @Field(() => ShiftStatus, { nullable: true })
  @IsEnum(ShiftStatus)
  @IsOptional()
  status?: ShiftStatus;
}

@InputType()
export class RepeatShiftInput {
  @Field()
  @IsUUID()
  @IsNotEmpty()
  timeslotId: string;

  @Field(() => [String])
  @IsArray()
  @IsDateString({}, { each: true })
  dates: string[];

  @Field(() => Int, { defaultValue: 1 })
  @IsInt()
  @Min(1)
  @IsOptional()
  requiredStaff?: number;
}