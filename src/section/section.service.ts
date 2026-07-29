import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSectionDto } from './dto/create-section.dto';
import { UpdateSectionDto } from './dto/update-section.dto';

@Injectable()
export class SectionService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateSectionDto) {
    await this.ensureClassExists(dto.classId);

    const code = dto.code.trim().toUpperCase();
    const name = dto.name.trim();

    await this.ensureUniqueValues(dto.classId, code, name);

    return this.prisma.section.create({
      data: {
        classId: dto.classId,
        code,
        name,
        capacity: dto.capacity,
        isActive: dto.isActive ?? true,
      },
      include: {
        class: {
          include: {
            school: true,
          },
        },
      },
    });
  }

  async findAll() {
    return this.prisma.section.findMany({
      include: {
        class: {
          include: {
            school: true,
          },
        },
      },
      orderBy: [
        { classId: 'asc' },
        { name: 'asc' },
      ],
    });
  }

  async findOne(id: number) {
    const section = await this.prisma.section.findUnique({
      where: { id },
      include: {
        class: {
          include: {
            school: true,
          },
        },
      },
    });

    if (!section) {
      throw new NotFoundException('Section not found.');
    }

    return section;
  }

  async findByClass(classId: number) {
    await this.ensureClassExists(classId);

    return this.prisma.section.findMany({
      where: { classId },
      include: {
        class: {
          include: {
            school: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });
  }

  async update(id: number, dto: UpdateSectionDto) {
    const currentSection = await this.prisma.section.findUnique({
      where: { id },
    });

    if (!currentSection) {
      throw new NotFoundException('Section not found.');
    }

    const targetClassId = dto.classId ?? currentSection.classId;
    const code =
      dto.code !== undefined
        ? dto.code.trim().toUpperCase()
        : currentSection.code;
    const name =
      dto.name !== undefined
        ? dto.name.trim()
        : currentSection.name;

    if (dto.classId !== undefined) {
      await this.ensureClassExists(dto.classId);
    }

    await this.ensureUniqueValues(targetClassId, code, name, id);

    return this.prisma.section.update({
      where: { id },
      data: {
        ...(dto.classId !== undefined && {
          classId: dto.classId,
        }),
        ...(dto.code !== undefined && {
          code,
        }),
        ...(dto.name !== undefined && {
          name,
        }),
        ...(dto.capacity !== undefined && {
          capacity: dto.capacity,
        }),
        ...(dto.isActive !== undefined && {
          isActive: dto.isActive,
        }),
      },
      include: {
        class: {
          include: {
            school: true,
          },
        },
      },
    });
  }

  async activate(id: number) {
    await this.ensureSectionExists(id);

    return this.prisma.section.update({
      where: { id },
      data: { isActive: true },
      include: {
        class: true,
      },
    });
  }

  async deactivate(id: number) {
    await this.ensureSectionExists(id);

    return this.prisma.section.update({
      where: { id },
      data: { isActive: false },
      include: {
        class: true,
      },
    });
  }

  async remove(id: number) {
    await this.ensureSectionExists(id);

    try {
      await this.prisma.section.delete({
        where: { id },
      });

      return {
        message: 'Section deleted successfully.',
      };
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2003'
      ) {
        throw new ConflictException(
          'Section cannot be deleted because it is linked to other records.',
        );
      }

      throw error;
    }
  }

  private async ensureClassExists(classId: number): Promise<void> {
    const classRecord = await this.prisma.class.findUnique({
      where: { id: classId },
      select: { id: true },
    });

    if (!classRecord) {
      throw new NotFoundException('Class not found.');
    }
  }

  private async ensureSectionExists(id: number): Promise<void> {
    const section = await this.prisma.section.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!section) {
      throw new NotFoundException('Section not found.');
    }
  }

  private async ensureUniqueValues(
    classId: number,
    code: string,
    name: string,
    excludeId?: number,
  ): Promise<void> {
    const duplicateCode = await this.prisma.section.findFirst({
      where: {
        classId,
        code,
        ...(excludeId !== undefined && {
          id: { not: excludeId },
        }),
      },
      select: { id: true },
    });

    if (duplicateCode) {
      throw new ConflictException(
        'Section code already exists in this class.',
      );
    }

    const duplicateName = await this.prisma.section.findFirst({
      where: {
        classId,
        name: {
          equals: name,
          mode: 'insensitive',
        },
        ...(excludeId !== undefined && {
          id: { not: excludeId },
        }),
      },
      select: { id: true },
    });

    if (duplicateName) {
      throw new ConflictException(
        'Section name already exists in this class.',
      );
    }
  }
}