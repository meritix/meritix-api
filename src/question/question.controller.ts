import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { QuestionService } from './question.service';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';

@Controller('questions')
@UseGuards(JwtAuthGuard)
export class QuestionController {
  constructor(
    private readonly questionService: QuestionService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateQuestionDto) {
    return this.questionService.create(dto);
  }

  @Get()
  findAll() {
    return this.questionService.findAll();
  }

  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.questionService.findOne(id);
  }

  @Get('subject/:subjectId')
  findBySubject(
    @Param('subjectId', ParseIntPipe)
    subjectId: number,
  ) {
    return this.questionService.findBySubject(
      subjectId,
    );
  }

  @Get('chapter/:chapterId')
  findByChapter(
    @Param('chapterId', ParseIntPipe)
    chapterId: number,
  ) {
    return this.questionService.findByChapter(
      chapterId,
    );
  }

  @Get('topic/:topicId')
  findByTopic(
    @Param('topicId', ParseIntPipe)
    topicId: number,
  ) {
    return this.questionService.findByTopic(
      topicId,
    );
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateQuestionDto,
  ) {
    return this.questionService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  remove(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.questionService.remove(id);
  }
}