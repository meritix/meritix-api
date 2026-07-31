import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateTopicDto {
  @IsInt()
  @Min(1)
  chapterId: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(30)
  code: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  sequence?: number = 1;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean = true;
}