import { InputType, Field } from '@nestjs/graphql';
import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MinLength,
} from 'class-validator';
import { AssignmentStatus } from '../entities/assignment.entity';

@InputType()
export class CreateAssignmentInput {
  @Field()
  @IsUUID()
  @IsNotEmpty()
  shiftId: string;

  @Field()
  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @Field(() => AssignmentStatus, { defaultValue: AssignmentStatus.ASSIGNED })
  @IsEnum(AssignmentStatus)
  @IsOptional()
  status?: AssignmentStatus;
}

@InputType()
export class MarkUnavailableInput {
  @Field()
  @IsUUID()
  @IsNotEmpty()
  assignmentId: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  @MinLength(10, { message: 'Please provide a detailed reason (at least 10 characters)' })
  reason: string;
}

@InputType()
export class FilterAssignmentInput {
  @Field({ nullable: true })
  @IsUUID()
  @IsOptional()
  userId?: string;

  @Field({ nullable: true })
  @IsUUID()
  @IsOptional()
  shiftId?: string;

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

  @Field(() => AssignmentStatus, { nullable: true })
  @IsEnum(AssignmentStatus)
  @IsOptional()
  status?: AssignmentStatus;
}