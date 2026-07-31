import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUrl,
  MaxLength,
  Min,
} from 'class-validator';
import { Difficulty, QuestionType } from '@prisma/client';

export class CreateQuestionDto {
  @IsInt()
  @Min(1)
  subjectId: number;

  @IsInt()
  @Min(1)
  chapterId: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  topicId?: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(30)
  code: string;

  @IsString()
  @IsNotEmpty()
  questionText: string;

  @IsOptional()
  @IsString()
  explanation?: string;

  @IsOptional()
  @IsEnum(QuestionType)
  questionType?: QuestionType = QuestionType.SINGLE;

  @IsOptional()
  @IsEnum(Difficulty)
  difficulty?: Difficulty = Difficulty.MEDIUM;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  marks?: number = 1;

  @IsOptional()
  @IsNumber()
  @Min(0)
  negativeMarks?: number = 0;

  @IsOptional()
  @IsInt()
  @Min(1)
  estimatedTimeSeconds?: number;

  @IsOptional()
  @IsUrl()
  imageUrl?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean = true;
}