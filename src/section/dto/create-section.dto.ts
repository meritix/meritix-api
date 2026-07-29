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

export class CreateSectionDto {
  @IsInt({ message: 'Class ID must be an integer.' })
  @Min(1, { message: 'Class ID must be greater than zero.' })
  classId: number;

  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toUpperCase() : value,
  )
  @IsString({ message: 'Section code must be a string.' })
  @IsNotEmpty({ message: 'Section code is required.' })
  @Length(1, 20, {
    message: 'Section code must contain between 1 and 20 characters.',
  })
  code: string;

  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString({ message: 'Section name must be a string.' })
  @IsNotEmpty({ message: 'Section name is required.' })
  @Length(1, 100, {
    message: 'Section name must contain between 1 and 100 characters.',
  })
  name: string;

  @IsOptional()
  @IsInt({ message: 'Capacity must be an integer.' })
  @Min(1, { message: 'Capacity must be greater than zero.' })
  capacity?: number;

  @IsOptional()
  @IsBoolean({ message: 'isActive must be a boolean value.' })
  isActive?: boolean;
}