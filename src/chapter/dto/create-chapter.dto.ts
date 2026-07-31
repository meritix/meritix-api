import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  Length,
  Matches,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateChapterDto {
  @Transform(({ value }) => Number(value))
  @IsInt({ message: 'Subject ID must be an integer.' })
  @IsPositive({ message: 'Subject ID must be greater than zero.' })
  subjectId!: number;

  @Transform(({ value }) =>
    typeof value === 'string'
      ? value.trim().toUpperCase()
      : value,
  )
  @IsString({ message: 'Chapter code must be a string.' })
  @IsNotEmpty({ message: 'Chapter code is required.' })
  @Length(1, 30, {
    message: 'Chapter code must be between 1 and 30 characters.',
  })
  @Matches(/^[A-Z0-9_-]+$/, {
    message:
      'Chapter code may contain only uppercase letters, numbers, hyphens (-), and underscores (_).',
  })
  code!: string;

  @Transform(({ value }) =>
    typeof value === 'string'
      ? value.trim()
      : value,
  )
  @IsString({ message: 'Chapter name must be a string.' })
  @IsNotEmpty({ message: 'Chapter name is required.' })
  @Length(1, 150, {
    message: 'Chapter name must be between 1 and 150 characters.',
  })
  name!: string;

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
  @Transform(({ value }) => Number(value))
  @IsInt({ message: 'Sequence must be an integer.' })
  @Min(1, {
    message: 'Sequence must be at least 1.',
  })
  sequence?: number;

  @IsOptional()
  @IsBoolean({ message: 'isActive must be a boolean.' })
  isActive?: boolean;
}