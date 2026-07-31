import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateChapterDto } from './dto/create-chapter.dto';
import { UpdateChapterDto } from './dto/update-chapter.dto';

@Injectable()
export class ChapterService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateChapterDto) {
    await this.ensureSubjectExists(dto.subjectId);

    const code = dto.code.trim().toUpperCase();
    const name = dto.name.trim();

    await this.ensureUniqueValues(
      dto.subjectId,
      code,
      name,
    );

    return this.prisma.chapter.create({
      data: {
        subjectId: dto.subjectId,
        code,
        name,
        description: dto.description?.trim(),
        sequence: dto.sequence ?? 1,
        isActive: dto.isActive ?? true,
      },
      include: {
        subject: true,
      },
    });
  }

  async findAll() {
    return this.prisma.chapter.findMany({
      include: {
        subject: true,
      },
      orderBy: [
        {
          subject: {
            name: 'asc',
          },
        },
        {
          sequence: 'asc',
        },
        {
          name: 'asc',
        },
      ],
    });
  }

  async findOne(id: number) {
    const chapter =
      await this.prisma.chapter.findUnique({
        where: { id },
        include: {
          subject: true,
        },
      });

    if (!chapter) {
      throw new NotFoundException(
        'Chapter not found.',
      );
    }

    return chapter;
  }

  async findBySubject(subjectId: number) {
    await this.ensureSubjectExists(subjectId);

    return this.prisma.chapter.findMany({
      where: {
        subjectId,
      },
      orderBy: [
        {
          sequence: 'asc',
        },
        {
          name: 'asc',
        },
      ],
    });
  }

  async update(
    id: number,
    dto: UpdateChapterDto,
  ) {
    const current =
      await this.prisma.chapter.findUnique({
        where: { id },
      });

    if (!current) {
      throw new NotFoundException(
        'Chapter not found.',
      );
    }

    const subjectId =
      dto.subjectId ?? current.subjectId;

    await this.ensureSubjectExists(subjectId);

    const code =
      dto.code !== undefined
        ? dto.code.trim().toUpperCase()
        : current.code;

    const name =
      dto.name !== undefined
        ? dto.name.trim()
        : current.name;

    await this.ensureUniqueValues(
      subjectId,
      code,
      name,
      id,
    );

    return this.prisma.chapter.update({
      where: { id },
      data: {
        ...(dto.subjectId !== undefined && {
          subjectId,
        }),
        ...(dto.code !== undefined && {
          code,
        }),
        ...(dto.name !== undefined && {
          name,
        }),
        ...(dto.description !== undefined && {
          description:
            dto.description?.trim(),
        }),
        ...(dto.sequence !== undefined && {
          sequence: dto.sequence,
        }),
        ...(dto.isActive !== undefined && {
          isActive: dto.isActive,
        }),
      },
      include: {
        subject: true,
      },
    });
  }

  async activate(id: number) {
    await this.ensureChapterExists(id);

    return this.prisma.chapter.update({
      where: { id },
      data: {
        isActive: true,
      },
    });
  }

  async deactivate(id: number) {
    await this.ensureChapterExists(id);

    return this.prisma.chapter.update({
      where: { id },
      data: {
        isActive: false,
      },
    });
  }

  async remove(id: number) {
    await this.ensureChapterExists(id);

    try {
      await this.prisma.chapter.delete({
        where: { id },
      });

      return {
        message:
          'Chapter deleted successfully.',
      };
    } catch (error) {
      if (
        error instanceof
          Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2003'
      ) {
        throw new ConflictException(
          'Chapter cannot be deleted because it is linked to other records.',
        );
      }

      throw error;
    }
  }

  private async ensureSubjectExists(
    subjectId: number,
  ) {
    const subject =
      await this.prisma.subject.findUnique({
        where: {
          id: subjectId,
        },
        select: {
          id: true,
        },
      });

    if (!subject) {
      throw new NotFoundException(
        'Subject not found.',
      );
    }
  }

  private async ensureChapterExists(
    id: number,
  ) {
    const chapter =
      await this.prisma.chapter.findUnique({
        where: { id },
        select: {
          id: true,
        },
      });

    if (!chapter) {
      throw new NotFoundException(
        'Chapter not found.',
      );
    }
  }

  private async ensureUniqueValues(
    subjectId: number,
    code: string,
    name: string,
    excludeId?: number,
  ) {
    const duplicateCode =
      await this.prisma.chapter.findFirst({
        where: {
          subjectId,
          code,
          ...(excludeId !== undefined && {
            id: {
              not: excludeId,
            },
          }),
        },
      });

    if (duplicateCode) {
      throw new ConflictException(
        'Chapter code already exists in this subject.',
      );
    }

    const duplicateName =
      await this.prisma.chapter.findFirst({
        where: {
          subjectId,
          name: {
            equals: name,
            mode: 'insensitive',
          },
          ...(excludeId !== undefined && {
            id: {
              not: excludeId,
            },
          }),
        },
      });

    if (duplicateName) {
      throw new ConflictException(
        'Chapter name already exists in this subject.',
      );
    }
  }
}