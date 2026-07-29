import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAcademicYearDto } from './dto/create-academic-year.dto';
import { UpdateAcademicYearDto } from './dto/update-academic-year.dto';

@Injectable()
export class AcademicYearService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateAcademicYearDto) {
    const name = dto.name.trim();
    const startDate = new Date(dto.startDate);
    const endDate = new Date(dto.endDate);

    this.validateDateRange(startDate, endDate);

    const duplicate = await this.prisma.academicYear.findFirst({
      where: {
        name: {
          equals: name,
          mode: 'insensitive',
        },
      },
      select: { id: true },
    });

    if (duplicate) {
      throw new ConflictException(
        'Academic year name already exists.',
      );
    }

    return this.prisma.$transaction(async (tx) => {
      if (dto.isActive === true) {
        await tx.academicYear.updateMany({
          where: { isActive: true },
          data: { isActive: false },
        });
      }

      return tx.academicYear.create({
        data: {
          name,
          startDate,
          endDate,
          isActive: dto.isActive ?? false,
        },
      });
    });
  }

  async findAll() {
    return this.prisma.academicYear.findMany({
      orderBy: [
        { startDate: 'desc' },
        { name: 'asc' },
      ],
    });
  }

  async findOne(id: number) {
    const academicYear =
      await this.prisma.academicYear.findUnique({
        where: { id },
      });

    if (!academicYear) {
      throw new NotFoundException('Academic year not found.');
    }

    return academicYear;
  }

  async findActive() {
    const academicYear =
      await this.prisma.academicYear.findFirst({
        where: { isActive: true },
      });

    if (!academicYear) {
      throw new NotFoundException(
        'No active academic year found.',
      );
    }

    return academicYear;
  }

  async update(id: number, dto: UpdateAcademicYearDto) {
    const current = await this.prisma.academicYear.findUnique({
      where: { id },
    });

    if (!current) {
      throw new NotFoundException('Academic year not found.');
    }

    const name =
      dto.name !== undefined ? dto.name.trim() : current.name;

    const startDate =
      dto.startDate !== undefined
        ? new Date(dto.startDate)
        : current.startDate;

    const endDate =
      dto.endDate !== undefined
        ? new Date(dto.endDate)
        : current.endDate;

    this.validateDateRange(startDate, endDate);

    const duplicate = await this.prisma.academicYear.findFirst({
      where: {
        id: { not: id },
        name: {
          equals: name,
          mode: 'insensitive',
        },
      },
      select: { id: true },
    });

    if (duplicate) {
      throw new ConflictException(
        'Academic year name already exists.',
      );
    }

    return this.prisma.$transaction(async (tx) => {
      if (dto.isActive === true) {
        await tx.academicYear.updateMany({
          where: {
            id: { not: id },
            isActive: true,
          },
          data: {
            isActive: false,
          },
        });
      }

      return tx.academicYear.update({
        where: { id },
        data: {
          ...(dto.name !== undefined && { name }),
          ...(dto.startDate !== undefined && { startDate }),
          ...(dto.endDate !== undefined && { endDate }),
          ...(dto.isActive !== undefined && {
            isActive: dto.isActive,
          }),
        },
      });
    });
  }

  async activate(id: number) {
    await this.ensureAcademicYearExists(id);

    return this.prisma.$transaction(async (tx) => {
      await tx.academicYear.updateMany({
        where: {
          id: { not: id },
          isActive: true,
        },
        data: {
          isActive: false,
        },
      });

      return tx.academicYear.update({
        where: { id },
        data: {
          isActive: true,
        },
      });
    });
  }

  async deactivate(id: number) {
    await this.ensureAcademicYearExists(id);

    return this.prisma.academicYear.update({
      where: { id },
      data: {
        isActive: false,
      },
    });
  }

  async remove(id: number) {
    await this.ensureAcademicYearExists(id);

    try {
      await this.prisma.academicYear.delete({
        where: { id },
      });

      return {
        message: 'Academic year deleted successfully.',
      };
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2003'
      ) {
        throw new ConflictException(
          'Academic year cannot be deleted because it is linked to other records.',
        );
      }

      throw error;
    }
  }

  private validateDateRange(
    startDate: Date,
    endDate: Date,
  ): void {
    if (
      Number.isNaN(startDate.getTime()) ||
      Number.isNaN(endDate.getTime())
    ) {
      throw new BadRequestException(
        'Start date and end date must be valid dates.',
      );
    }

    if (endDate <= startDate) {
      throw new BadRequestException(
        'End date must be later than start date.',
      );
    }
  }

  private async ensureAcademicYearExists(
    id: number,
  ): Promise<void> {
    const record = await this.prisma.academicYear.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!record) {
      throw new NotFoundException('Academic year not found.');
    }
  }
}