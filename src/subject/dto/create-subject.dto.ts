import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  Matches,
  MaxLength,
} from 'class-validator';

export class CreateSubjectDto {
  @Transform(({ value }) =>
    typeof value === 'string'
      ? value.trim().toUpperCase()
      : value,
  )
  @IsString({ message: 'Subject code must be a string.' })
  @IsNotEmpty({ message: 'Subject code is required.' })
  @Length(1, 30, {
    message: 'Subject code must be between 1 and 30 characters.',
  })
  @Matches(/^[A-Z0-9_-]+$/, {
    message:
      'Subject code may contain only uppercase letters, numbers, hyphens (-), and underscores (_).',
  })
  code!: string;

  @Transform(({ value }) =>
    typeof value === 'string'
      ? value.trim()
      : value,
  )
  @IsString({ message: 'Subject name must be a string.' })
  @IsNotEmpty({ message: 'Subject name is required.' })
  @Length(1, 150, {
    message: 'Subject name must be between 1 and 150 characters.',
  })
  name!: string;

  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string'
      ? value.trim() || undefined
      : value,
  )
  @IsString({ message: 'Short name must be a string.' })
  @MaxLength(50, {
    message: 'Short name cannot exceed 50 characters.',
  })
  shortName?: string;

  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string'
      ? value.trim() || undefined
      : value,
  )
  @IsString({ message: 'Description must be a string.' })
  @MaxLength(1000, {
    message: 'Description cannot exceed 1000 characters.',
  })
  description?: string;

  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string'
      ? value.trim() || undefined
      : value,
  )
  @IsString({ message: 'Category must be a string.' })
  @MaxLength(100, {
    message: 'Category cannot exceed 100 characters.',
  })
  category?: string;

  @IsOptional()
  @IsBoolean({ message: 'isActive must be a boolean.' })
  isActive?: boolean;
}