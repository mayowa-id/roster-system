import { InputType, Field } from '@nestjs/graphql';
import { IsNotEmpty, IsString, Matches } from 'class-validator';

@InputType()
export class CreateTimeslotInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  name: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'startTime must be in HH:MM format (24-hour)',
  })
  startTime: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'endTime must be in HH:MM format (24-hour)',
  })
  endTime: string;
}