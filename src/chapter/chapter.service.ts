import {
  BadRequestException,
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

  async create(createChapterDto: CreateChapterDto) {
    const name = createChapterDto.name.trim();
    const code = createChapterDto.code.trim().toUpperCase();
    const description = createChapterDto.description?.trim() || null;

    await this.ensureSubjectExists(createChapterDto.subjectId);

    await this.ensureChapterIsUnique(
      createChapterDto.subjectId,
      name,
      code,
    );

    return this.prisma.chapter.create({
      data: {
        name,
        code,
        description,
        subjectId: createChapterDto.subjectId,
        sequence: createChapterDto.sequence ?? 1,
        isActive: createChapterDto.isActive ?? true,
      },
      include: {
        subject: true,
      },
    });
  }

  async findAll(
    search?: string,
    subjectId?: number,
    isActive?: boolean,
    page = 1,
    limit = 20,
  ) {
    const safePage = Math.max(page, 1);
    const safeLimit = Math.min(Math.max(limit, 1), 100);
    const skip = (safePage - 1) * safeLimit;

    const where: Prisma.ChapterWhereInput = {
      ...(subjectId !== undefined && { subjectId }),
      ...(isActive !== undefined && { isActive }),
      ...(search?.trim() && {
        OR: [
          {
            name: {
              contains: search.trim(),
              mode: 'insensitive',
            },
          },
          {
            code: {
              contains: search.trim(),
              mode: 'insensitive',
            },
          },
          {
            description: {
              contains: search.trim(),
              mode: 'insensitive',
            },
          },
        ],
      }),
    };

    const [data, total] = await Promise.all([
      this.prisma.chapter.findMany({
        where,
        skip,
        take: safeLimit,
        orderBy: [
          {
            sequence: 'asc',
          },
          {
            name: 'asc',
          },
        ],
        include: {
          subject: true,
        },
      }),

      this.prisma.chapter.count({
        where,
      }),
    ]);

    return {
      data,
      pagination: {
        total,
        page: safePage,
        limit: safeLimit,
        totalPages: Math.ceil(total / safeLimit),
      },
    };
  }

  async findOne(id: number) {
    const chapter = await this.prisma.chapter.findUnique({
      where: {
        id,
      },
      include: {
        subject: true,
      },
    });

    if (!chapter) {
      throw new NotFoundException('Chapter not found.');
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
      include: {
        subject: true,
      },
    });
  }

  async update(id: number, updateChapterDto: UpdateChapterDto) {
    const existingChapter = await this.findOne(id);

    const subjectId =
      updateChapterDto.subjectId ?? existingChapter.subjectId;

    const name =
      updateChapterDto.name !== undefined
        ? updateChapterDto.name.trim()
        : existingChapter.name;

    const code =
      updateChapterDto.code !== undefined
        ? updateChapterDto.code.trim().toUpperCase()
        : existingChapter.code;

    const description =
      updateChapterDto.description !== undefined
        ? updateChapterDto.description.trim() || null
        : existingChapter.description;

    if (updateChapterDto.subjectId !== undefined) {
      await this.ensureSubjectExists(subjectId);
    }

    await this.ensureChapterIsUnique(subjectId, name, code, id);

    try {
      return await this.prisma.chapter.update({
        where: {
          id,
        },
        data: {
          ...(updateChapterDto.name !== undefined && { name }),
          ...(updateChapterDto.code !== undefined && { code }),
          ...(updateChapterDto.description !== undefined && {
            description,
          }),
          ...(updateChapterDto.subjectId !== undefined && {
            subjectId,
          }),
          ...(updateChapterDto.sequence !== undefined && {
            sequence: updateChapterDto.sequence,
          }),
          ...(updateChapterDto.isActive !== undefined && {
            isActive: updateChapterDto.isActive,
          }),
        },
        include: {
          subject: true,
        },
      });
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  async remove(id: number) {
    await this.findOne(id);

    return this.prisma.chapter.delete({
      where: {
        id,
      },
    });
  }

  async changeStatus(id: number, isActive: boolean) {
    await this.findOne(id);

    return this.prisma.chapter.update({
      where: {
        id,
      },
      data: {
        isActive,
      },
      include: {
        subject: true,
      },
    });
  }

  private async ensureSubjectExists(subjectId: number) {
    const subject = await this.prisma.subject.findUnique({
      where: {
        id: subjectId,
      },
      select: {
        id: true,
      },
    });

    if (!subject) {
      throw new BadRequestException('Subject not found.');
    }
  }

  private async ensureChapterIsUnique(
    subjectId: number,
    name: string,
    code: string,
    excludeId?: number,
  ) {
    const duplicate = await this.prisma.chapter.findFirst({
      where: {
        subjectId,
        ...(excludeId !== undefined && {
          id: {
            not: excludeId,
          },
        }),
        OR: [
          {
            name: {
              equals: name,
              mode: 'insensitive',
            },
          },
          {
            code: {
              equals: code,
              mode: 'insensitive',
            },
          },
        ],
      },
      select: {
        name: true,
        code: true,
      },
    });

    if (!duplicate) {
      return;
    }

    if (duplicate.name.toLowerCase() === name.toLowerCase()) {
      throw new ConflictException(
        'A chapter with this name already exists for the subject.',
      );
    }

    throw new ConflictException(
      'A chapter with this code already exists for the subject.',
    );
  }

  private handlePrismaError(error: unknown): never {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      throw new ConflictException(
        'A chapter with this name or code already exists.',
      );
    }

    throw error;
  }
}