import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { AcademicYearController } from './academic-year.controller';
import { AcademicYearService } from './academic-year.service';

@Module({
  imports: [PrismaModule],
  controllers: [AcademicYearController],
  providers: [AcademicYearService],
  exports: [AcademicYearService],
})
export class AcademicYearModule {}
