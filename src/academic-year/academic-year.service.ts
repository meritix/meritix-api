import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAcademicYearDto } from './dto/create-academic-year.dto';
import { UpdateAcademicYearDto } from './dto/update-academic-year.dto';

@Injectable()
export class AcademicYearService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createAcademicYearDto: CreateAcademicYearDto) {
    const existingAcademicYear = await this.prisma.academicYear.findUnique({
      where: {
        name: createAcademicYearDto.name,
      },
    });

    if (existingAcademicYear) {
      throw new ConflictException(
        `Academic year ${createAcademicYearDto.name} already exists.`,
      );
    }

    const startDate = new Date(createAcademicYearDto.startDate);

    const endDate = new Date(createAcademicYearDto.endDate);

    if (startDate >= endDate) {
      throw new BadRequestException(
        'The academic year end date must be after the start date.',
      );
    }

    return this.prisma.$transaction(async (transaction) => {
      if (createAcademicYearDto.isActive) {
        await transaction.academicYear.updateMany({
          where: {
            isActive: true,
          },
          data: {
            isActive: false,
          },
        });
      }

      return transaction.academicYear.create({
        data: {
          name: createAcademicYearDto.name,
          startDate,
          endDate,
          isActive: createAcademicYearDto.isActive ?? false,
        },
      });
    });
  }

  async findAll() {
    return this.prisma.academicYear.findMany({
      orderBy: {
        startDate: 'desc',
      },
    });
  }

  async findActive() {
    const academicYear = await this.prisma.academicYear.findFirst({
      where: {
        isActive: true,
      },
    });

    if (!academicYear) {
      throw new NotFoundException('No active academic year was found.');
    }

    return academicYear;
  }

  async findOne(id: number) {
    const academicYear = await this.prisma.academicYear.findUnique({
      where: {
        id,
      },
    });

    if (!academicYear) {
      throw new NotFoundException(`Academic year with ID ${id} was not found.`);
    }

    return academicYear;
  }

  async update(id: number, updateAcademicYearDto: UpdateAcademicYearDto) {
    const existingAcademicYear = await this.findOne(id);

    if (
      updateAcademicYearDto.name &&
      updateAcademicYearDto.name !== existingAcademicYear.name
    ) {
      const duplicate = await this.prisma.academicYear.findUnique({
        where: {
          name: updateAcademicYearDto.name,
        },
      });

      if (duplicate) {
        throw new ConflictException(
          `Academic year ${updateAcademicYearDto.name} already exists.`,
        );
      }
    }

    const startDate = updateAcademicYearDto.startDate
      ? new Date(updateAcademicYearDto.startDate)
      : existingAcademicYear.startDate;

    const endDate = updateAcademicYearDto.endDate
      ? new Date(updateAcademicYearDto.endDate)
      : existingAcademicYear.endDate;

    if (startDate >= endDate) {
      throw new BadRequestException(
        'The academic year end date must be after the start date.',
      );
    }

    return this.prisma.$transaction(async (transaction) => {
      if (updateAcademicYearDto.isActive === true) {
        await transaction.academicYear.updateMany({
          where: {
            isActive: true,
            NOT: {
              id,
            },
          },
          data: {
            isActive: false,
          },
        });
      }

      return transaction.academicYear.update({
        where: {
          id,
        },
        data: {
          name: updateAcademicYearDto.name,
          startDate,
          endDate,
          isActive: updateAcademicYearDto.isActive,
        },
      });
    });
  }

  async activate(id: number) {
    await this.findOne(id);

    return this.prisma.$transaction(async (transaction) => {
      await transaction.academicYear.updateMany({
        where: {
          isActive: true,
        },
        data: {
          isActive: false,
        },
      });

      return transaction.academicYear.update({
        where: {
          id,
        },
        data: {
          isActive: true,
        },
      });
    });
  }

  async remove(id: number) {
    const academicYear = await this.findOne(id);

    if (academicYear.isActive) {
      throw new BadRequestException(
        'The active academic year cannot be deleted.',
      );
    }

    await this.prisma.academicYear.delete({
      where: {
        id,
      },
    });

    return {
      message: 'Academic year deleted successfully.',
    };
  }
}
