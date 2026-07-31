import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';

@Injectable()
export class QuestionService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async create(dto: CreateQuestionDto) {
    // Check Subject
    const subject = await this.prisma.subject.findUnique({
      where: {
        id: dto.subjectId,
      },
    });

    if (!subject) {
      throw new NotFoundException(
        'Subject not found.',
      );
    }

    // Check Chapter
    const chapter = await this.prisma.chapter.findUnique({
      where: {
        id: dto.chapterId,
      },
    });

    if (!chapter) {
      throw new NotFoundException(
        'Chapter not found.',
      );
    }

    if (chapter.subjectId !== dto.subjectId) {
      throw new BadRequestException(
        'Chapter does not belong to the selected subject.',
      );
    }

    // Check Topic (Optional)
    if (dto.topicId) {
      const topic = await this.prisma.topic.findUnique({
        where: {
          id: dto.topicId,
        },
      });

      if (!topic) {
        throw new NotFoundException(
          'Topic not found.',
        );
      }

      if (topic.chapterId !== dto.chapterId) {
        throw new BadRequestException(
          'Topic does not belong to the selected chapter.',
        );
      }
    }

    // Duplicate Code
    const existing = await this.prisma.question.findFirst({
      where: {
        chapterId: dto.chapterId,
        code: dto.code,
      },
    });

    if (existing) {
      throw new BadRequestException(
        'Question code already exists in this chapter.',
      );
    }

    return this.prisma.question.create({
      data: dto,
    });
  }

  async findAll() {
    return this.prisma.question.findMany({
      include: {
        subject: true,
        chapter: true,
        topic: true,
      },
      orderBy: {
        id: 'asc',
      },
    });
  }

  async findOne(id: number) {
    const question =
      await this.prisma.question.findUnique({
        where: {
          id,
        },
        include: {
          subject: true,
          chapter: true,
          topic: true,
        },
      });

    if (!question) {
      throw new NotFoundException(
        'Question not found.',
      );
    }

    return question;
  }

  async findBySubject(subjectId: number) {
    return this.prisma.question.findMany({
      where: {
        subjectId,
      },
      include: {
        chapter: true,
        topic: true,
      },
      orderBy: {
        id: 'asc',
      },
    });
  }

  async findByChapter(chapterId: number) {
    return this.prisma.question.findMany({
      where: {
        chapterId,
      },
      include: {
        subject: true,
        topic: true,
      },
      orderBy: {
        id: 'asc',
      },
    });
  }

  async findByTopic(topicId: number) {
    return this.prisma.question.findMany({
      where: {
        topicId,
      },
      include: {
        subject: true,
        chapter: true,
      },
      orderBy: {
        id: 'asc',
      },
    });
  }

  async update(
    id: number,
    dto: UpdateQuestionDto,
  ) {
    const question =
      await this.prisma.question.findUnique({
        where: {
          id,
        },
      });

    if (!question) {
      throw new NotFoundException(
        'Question not found.',
      );
    }

    if (dto.subjectId) {
      const subject =
        await this.prisma.subject.findUnique({
          where: {
            id: dto.subjectId,
          },
        });

      if (!subject) {
        throw new NotFoundException(
          'Subject not found.',
        );
      }
    }

    if (dto.chapterId) {
      const chapter =
        await this.prisma.chapter.findUnique({
          where: {
            id: dto.chapterId,
          },
        });

      if (!chapter) {
        throw new NotFoundException(
          'Chapter not found.',
        );
      }
    }

    if (dto.topicId) {
      const topic =
        await this.prisma.topic.findUnique({
          where: {
            id: dto.topicId,
          },
        });

      if (!topic) {
        throw new NotFoundException(
          'Topic not found.',
        );
      }
    }

    return this.prisma.question.update({
      where: {
        id,
      },
      data: dto,
    });
  }

  async remove(id: number) {
    const question =
      await this.prisma.question.findUnique({
        where: {
          id,
        },
      });

    if (!question) {
      throw new NotFoundException(
        'Question not found.',
      );
    }

    await this.prisma.question.delete({
      where: {
        id,
      },
    });

    return {
      message:
        'Question deleted successfully.',
    };
  }
}