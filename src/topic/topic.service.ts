import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTopicDto } from './dto/create-topic.dto';
import { UpdateTopicDto } from './dto/update-topic.dto';

@Injectable()
export class TopicService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createTopicDto: CreateTopicDto) {
    const chapter = await this.prisma.chapter.findUnique({
      where: {
        id: createTopicDto.chapterId,
      },
    });

    if (!chapter) {
      throw new NotFoundException('Chapter not found.');
    }

    const existingCode = await this.prisma.topic.findFirst({
      where: {
        chapterId: createTopicDto.chapterId,
        code: createTopicDto.code,
      },
    });

    if (existingCode) {
      throw new BadRequestException(
        'Topic code already exists in this chapter.',
      );
    }

    const existingName = await this.prisma.topic.findFirst({
      where: {
        chapterId: createTopicDto.chapterId,
        name: createTopicDto.name,
      },
    });

    if (existingName) {
      throw new BadRequestException(
        'Topic name already exists in this chapter.',
      );
    }

    return this.prisma.topic.create({
      data: {
        chapterId: createTopicDto.chapterId,
        code: createTopicDto.code,
        name: createTopicDto.name,
        description: createTopicDto.description,
        sequence: createTopicDto.sequence,
        isActive: createTopicDto.isActive,
      },
    });
  }

  async findAll() {
    return this.prisma.topic.findMany({
      include: {
        chapter: {
          include: {
            subject: true,
          },
        },
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

  async findOne(id: number) {
    const topic = await this.prisma.topic.findUnique({
      where: {
        id,
      },
      include: {
        chapter: {
          include: {
            subject: true,
          },
        },
      },
    });

    if (!topic) {
      throw new NotFoundException('Topic not found.');
    }

    return topic;
  }

  async findByChapter(chapterId: number) {
    return this.prisma.topic.findMany({
      where: {
        chapterId,
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

  async update(id: number, updateTopicDto: UpdateTopicDto) {
    const topic = await this.prisma.topic.findUnique({
      where: {
        id,
      },
    });

    if (!topic) {
      throw new NotFoundException('Topic not found.');
    }

    if (updateTopicDto.chapterId) {
      const chapter = await this.prisma.chapter.findUnique({
        where: {
          id: updateTopicDto.chapterId,
        },
      });

      if (!chapter) {
        throw new NotFoundException('Chapter not found.');
      }
    }

    return this.prisma.topic.update({
      where: {
        id,
      },
      data: updateTopicDto,
    });
  }

  async remove(id: number) {
    const topic = await this.prisma.topic.findUnique({
      where: {
        id,
      },
    });

    if (!topic) {
      throw new NotFoundException('Topic not found.');
    }

    await this.prisma.topic.delete({
      where: {
        id,
      },
    });

    return {
      message: 'Topic deleted successfully.',
    };
  }
}