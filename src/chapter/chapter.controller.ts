import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseBoolPipe,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ChapterService } from './chapter.service';
import { CreateChapterDto } from './dto/create-chapter.dto';
import { UpdateChapterDto } from './dto/update-chapter.dto';

@Controller('chapters')
@UseGuards(JwtAuthGuard)
export class ChapterController {
  constructor(private readonly chapterService: ChapterService) {}

  @Post()
  create(@Body() createChapterDto: CreateChapterDto) {
    return this.chapterService.create(createChapterDto);
  }

  @Get()
  findAll(
    @Query('search') search?: string,
    @Query('subjectId') subjectId?: string,
    @Query('isActive') isActive?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.chapterService.findAll(
      search,
      subjectId !== undefined
        ? this.parsePositiveInteger(subjectId, 'subjectId')
        : undefined,
      isActive !== undefined
        ? this.parseBoolean(isActive, 'isActive')
        : undefined,
      page !== undefined
        ? this.parsePositiveInteger(page, 'page')
        : 1,
      limit !== undefined
        ? this.parsePositiveInteger(limit, 'limit')
        : 20,
    );
  }

  @Get('subject/:subjectId')
  findBySubject(
    @Param('subjectId', ParseIntPipe) subjectId: number,
  ) {
    return this.chapterService.findBySubject(subjectId);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.chapterService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateChapterDto: UpdateChapterDto,
  ) {
    return this.chapterService.update(id, updateChapterDto);
  }

  @Patch(':id/status')
  changeStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('isActive', ParseBoolPipe) isActive: boolean,
  ) {
    return this.chapterService.changeStatus(id, isActive);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.chapterService.remove(id);
  }

  private parsePositiveInteger(value: string, field: string) {
    const parsedValue = Number(value);

    if (!Number.isInteger(parsedValue) || parsedValue < 1) {
      throw new Error(`${field} must be a positive integer.`);
    }

    return parsedValue;
  }

  private parseBoolean(value: string, field: string) {
    if (value === 'true') {
      return true;
    }

    if (value === 'false') {
      return false;
    }

    throw new Error(`${field} must be true or false.`);
  }
}