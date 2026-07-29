import { Module } from '@nestjs/common';
import { AcademicYearModule } from './academic-year/academic-year.module';
import { AuthModule } from './auth/auth.module';
import { BoardModule } from './board/board.module';
import { PrismaModule } from './prisma/prisma.module';
import { StudentModule } from './student/student.module';
import { UsersModule } from './users/users.module';
import { SubjectModule } from './subject/subject.module';
import { SchoolModule } from './school/school.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    UsersModule,
    StudentModule,
    AcademicYearModule,
    BoardModule,
    SubjectModule,
    SchoolModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
