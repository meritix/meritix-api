import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateClassDto } from './dto/create-class.dto';
import { UpdateClassDto } from './dto/update-class.dto';

@Injectable()
export class ClassService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateClassDto) {
    const school = await this.prisma.school.findUnique({
      where: {
        id: dto.schoolId,
      },
      select: {
        id: true,
      },
    });

    if (!school) {
      throw new NotFoundException('School not found.');
    }

    const normalizedCode = dto.code.trim().toUpperCase();
    const normalizedName = dto.name.trim();

    const existingClass = await this.prisma.class.findFirst({
      where: {
        schoolId: dto.schoolId,
        OR: [
          {
            code: normalizedCode,
          },
          {
            name: {
              equals: normalizedName,
              mode: 'insensitive',
            },
          },
        ],
      },
      select: {
        code: true,
        name: true,
      },
    });

    if (existingClass?.code === normalizedCode) {
      throw new ConflictException(
        'Class code already exists in this school.',
      );
    }

    if (
      existingClass &&
      existingClass.name.toLowerCase() === normalizedName.toLowerCase()
    ) {
      throw new ConflictException(
        'Class name already exists in this school.',
      );
    }

    return this.prisma.class.create({
      data: {
        schoolId: dto.schoolId,
        code: normalizedCode,
        name: normalizedName,
        displayOrder: dto.displayOrder ?? 0,
        isActive: dto.isActive ?? true,
      },
      include: {
        school: true,
      },
    });
  }

  async findAll() {
    return this.prisma.class.findMany({
      include: {
        school: true,
      },
      orderBy: [
        {
          schoolId: 'asc',
        },
        {
          displayOrder: 'asc',
        },
        {
          name: 'asc',
        },
      ],
    });
  }

  async findOne(id: number) {
    const classRecord = await this.prisma.class.findUnique({
      where: {
        id,
      },
      include: {
        school: true,
      },
    });

    if (!classRecord) {
      throw new NotFoundException('Class not found.');
    }

    return classRecord;
  }

  async findBySchool(schoolId: number) {
    const school = await this.prisma.school.findUnique({
      where: {
        id: schoolId,
      },
      select: {
        id: true,
      },
    });

    if (!school) {
      throw new NotFoundException('School not found.');
    }

    return this.prisma.class.findMany({
      where: {
        schoolId,
      },
      include: {
        school: true,
      },
      orderBy: [
        {
          displayOrder: 'asc',
        },
        {
          name: 'asc',
        },
      ],
    });
  }

  async update(id: number, dto: UpdateClassDto) {
    const currentClass = await this.prisma.class.findUnique({
      where: {
        id,
      },
    });

    if (!currentClass) {
      throw new NotFoundException('Class not found.');
    }

    const targetSchoolId = dto.schoolId ?? currentClass.schoolId;

    if (dto.schoolId !== undefined) {
      const school = await this.prisma.school.findUnique({
        where: {
          id: dto.schoolId,
        },
        select: {
          id: true,
        },
      });

      if (!school) {
        throw new NotFoundException('School not found.');
      }
    }

    const normalizedCode =
      dto.code !== undefined
        ? dto.code.trim().toUpperCase()
        : currentClass.code;

    const normalizedName =
      dto.name !== undefined ? dto.name.trim() : currentClass.name;

    const duplicateCode = await this.prisma.class.findFirst({
      where: {
        id: {
          not: id,
        },
        schoolId: targetSchoolId,
        code: normalizedCode,
      },
      select: {
        id: true,
      },
    });

    if (duplicateCode) {
      throw new ConflictException(
        'Class code already exists in this school.',
      );
    }

    const duplicateName = await this.prisma.class.findFirst({
      where: {
        id: {
          not: id,
        },
        schoolId: targetSchoolId,
        name: {
          equals: normalizedName,
          mode: 'insensitive',
        },
      },
      select: {
        id: true,
      },
    });

    if (duplicateName) {
      throw new ConflictException(
        'Class name already exists in this school.',
      );
    }

    return this.prisma.class.update({
      where: {
        id,
      },
      data: {
        ...(dto.schoolId !== undefined && {
          schoolId: dto.schoolId,
        }),
        ...(dto.code !== undefined && {
          code: normalizedCode,
        }),
        ...(dto.name !== undefined && {
          name: normalizedName,
        }),
        ...(dto.displayOrder !== undefined && {
          displayOrder: dto.displayOrder,
        }),
        ...(dto.isActive !== undefined && {
          isActive: dto.isActive,
        }),
      },
      include: {
        school: true,
      },
    });
  }

  async activate(id: number) {
    await this.ensureClassExists(id);

    return this.prisma.class.update({
      where: {
        id,
      },
      data: {
        isActive: true,
      },
      include: {
        school: true,
      },
    });
  }

  async deactivate(id: number) {
    await this.ensureClassExists(id);

    return this.prisma.class.update({
      where: {
        id,
      },
      data: {
        isActive: false,
      },
      include: {
        school: true,
      },
    });
  }

  async remove(id: number) {
    await this.ensureClassExists(id);

    try {
      await this.prisma.class.delete({
        where: {
          id,
        },
      });

      return {
        message: 'Class deleted successfully.',
      };
    } catch {
      throw new ConflictException(
        'Class cannot be deleted because it is linked to other records.',
      );
    }
  }

  private async ensureClassExists(id: number): Promise<void> {
    const classRecord = await this.prisma.class.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
      },
    });

    if (!classRecord) {
      throw new NotFoundException('Class not found.');
    }
  }
}