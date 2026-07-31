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
import { ChapterService } from './chapter.service';
import { CreateChapterDto } from './dto/create-chapter.dto';
import { UpdateChapterDto } from './dto/update-chapter.dto';

@Controller('chapters')
@UseGuards(JwtAuthGuard)
export class ChapterController {
  constructor(
    private readonly chapterService: ChapterService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateChapterDto) {
    return this.chapterService.create(dto);
  }

  @Get()
  findAll() {
    return this.chapterService.findAll();
  }

  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.chapterService.findOne(id);
  }

  @Get('subject/:subjectId')
  findBySubject(
    @Param('subjectId', ParseIntPipe)
    subjectId: number,
  ) {
    return this.chapterService.findBySubject(
      subjectId,
    );
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateChapterDto,
  ) {
    return this.chapterService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  remove(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.chapterService.remove(id);
  }
}