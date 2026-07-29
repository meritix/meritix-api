import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { StudentService } from './student.service';

interface AuthenticatedRequest extends Request {
  user: {
    userId: number;
    email: string;
    role: string;
  };
}

@Controller('student')
@UseGuards(JwtAuthGuard)
export class StudentController {
  constructor(private readonly studentService: StudentService) {}

  @Post()
  create(
    @Req() request: AuthenticatedRequest,
    @Body() createStudentDto: CreateStudentDto,
  ) {
    return this.studentService.create(request.user.userId, createStudentDto);
  }

  @Get()
  findAll() {
    return this.studentService.findAll();
  }

  @Get('me')
  findMe(@Req() request: AuthenticatedRequest) {
    return this.studentService.findMe(request.user.userId);
  }

  @Get('meritix/:meritixId')
  findByMeritixId(@Param('meritixId') meritixId: string) {
    return this.studentService.findByMeritixId(meritixId.toUpperCase());
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.studentService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateStudentDto: UpdateStudentDto,
  ) {
    return this.studentService.update(id, updateStudentDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.studentService.remove(id);
  }
}
