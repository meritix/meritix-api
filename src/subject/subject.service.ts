import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSubjectDto } from './dto/create-subject.dto';
import { UpdateSubjectDto } from './dto/update-subject.dto';

@Injectable()
export class SubjectService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateSubjectDto) {
    const code = dto.code.trim().toUpperCase();
    const name = dto.name.trim();

    await this.ensureUniqueValues(code, name);

    return this.prisma.subject.create({
      data: {
        code,
        name,
        shortName: dto.shortName?.trim(),
        description: dto.description?.trim(),
        category: dto.category?.trim(),
        isActive: dto.isActive ?? true,
      },
    });
  }

  async findAll() {
    return this.prisma.subject.findMany({
      orderBy: [
        { name: 'asc' },
        { code: 'asc' },
      ],
    });
  }

  async findOne(id: number) {
    const subject = await this.prisma.subject.findUnique({
      where: { id },
    });

    if (!subject) {
      throw new NotFoundException('Subject not found.');
    }

    return subject;
  }

  async findByCode(code: string) {
    const subject = await this.prisma.subject.findUnique({
      where: {
        code: code.trim().toUpperCase(),
      },
    });

    if (!subject) {
      throw new NotFoundException('Subject not found.');
    }

    return subject;
  }

  async update(id: number, dto: UpdateSubjectDto) {
    const current = await this.prisma.subject.findUnique({
      where: { id },
    });

    if (!current) {
      throw new NotFoundException('Subject not found.');
    }

    const code =
      dto.code !== undefined
        ? dto.code.trim().toUpperCase()
        : current.code;

    const name =
      dto.name !== undefined
        ? dto.name.trim()
        : current.name;

    await this.ensureUniqueValues(code, name, id);

    return this.prisma.subject.update({
      where: { id },
      data: {
        ...(dto.code !== undefined && { code }),
        ...(dto.name !== undefined && { name }),
        ...(dto.shortName !== undefined && {
          shortName: dto.shortName.trim(),
        }),
        ...(dto.description !== undefined && {
          description: dto.description.trim(),
        }),
        ...(dto.category !== undefined && {
          category: dto.category.trim(),
        }),
        ...(dto.isActive !== undefined && {
          isActive: dto.isActive,
        }),
      },
    });
  }

  async activate(id: number) {
    await this.ensureSubjectExists(id);

    return this.prisma.subject.update({
      where: { id },
      data: { isActive: true },
    });
  }

  async deactivate(id: number) {
    await this.ensureSubjectExists(id);

    return this.prisma.subject.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async remove(id: number) {
    await this.ensureSubjectExists(id);

    try {
      await this.prisma.subject.delete({
        where: { id },
      });

      return {
        message: 'Subject deleted successfully.',
      };
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2003'
      ) {
        throw new ConflictException(
          'Subject cannot be deleted because it is linked to other records.',
        );
      }

      throw error;
    }
  }

  private async ensureSubjectExists(id: number): Promise<void> {
    const subject = await this.prisma.subject.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!subject) {
      throw new NotFoundException('Subject not found.');
    }
  }

  private async ensureUniqueValues(
    code: string,
    name: string,
    excludeId?: number,
  ): Promise<void> {
    const duplicateCode = await this.prisma.subject.findFirst({
      where: {
        code,
        ...(excludeId !== undefined && {
          id: { not: excludeId },
        }),
      },
      select: { id: true },
    });

    if (duplicateCode) {
      throw new ConflictException(
        'Subject code already exists.',
      );
    }

    const duplicateName = await this.prisma.subject.findFirst({
      where: {
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
        'Subject name already exists.',
      );
    }
  }
}