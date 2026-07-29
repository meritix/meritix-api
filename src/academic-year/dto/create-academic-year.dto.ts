import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';

export class CreateAcademicYearDto {
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString({ message: 'Academic year name must be a string.' })
  @IsNotEmpty({ message: 'Academic year name is required.' })
  @Length(3, 30, {
    message: 'Academic year name must contain between 3 and 30 characters.',
  })
  name: string;

  @IsDateString(
    {},
    { message: 'Start date must be a valid ISO date.' },
  )
  startDate: string;

  @IsDateString(
    {},
    { message: 'End date must be a valid ISO date.' },
  )
  endDate: string;

  @IsOptional()
  @IsBoolean({ message: 'isActive must be a boolean value.' })
  isActive?: boolean;
}