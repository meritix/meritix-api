import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  Min,
} from 'class-validator';

export class CreateClassDto {
  @IsInt({ message: 'School ID must be an integer.' })
  @Min(1, { message: 'School ID must be greater than zero.' })
  schoolId: number;

  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toUpperCase() : value,
  )
  @IsString({ message: 'Class code must be a string.' })
  @IsNotEmpty({ message: 'Class code is required.' })
  @Length(1, 20, {
    message: 'Class code must contain between 1 and 20 characters.',
  })
  code: string;

  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString({ message: 'Class name must be a string.' })
  @IsNotEmpty({ message: 'Class name is required.' })
  @Length(1, 100, {
    message: 'Class name must contain between 1 and 100 characters.',
  })
  name: string;

  @IsOptional()
  @IsInt({ message: 'Display order must be an integer.' })
  @Min(0, { message: 'Display order cannot be negative.' })
  displayOrder?: number;

  @IsOptional()
  @IsBoolean({ message: 'isActive must be a boolean value.' })
  isActive?: boolean;
}