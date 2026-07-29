import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSubjectDto } from './dto/create-subject.dto';
import { UpdateSubjectDto } from './dto/update-subject.dto';

@Injectable()
export class SubjectService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createSubjectDto: CreateSubjectDto) {
    const code = createSubjectDto.code.trim().toUpperCase();
    const name = createSubjectDto.name.trim();

    const existingCode = await this.prisma.subject.findUnique({
      where: { code },
    });

    if (existingCode) {
      throw new ConflictException(`Subject with code ${code} already exists.`);
    }

    const existingName = await this.prisma.subject.findUnique({
      where: { name },
    });

    if (existingName) {
      throw new ConflictException(`Subject with name ${name} already exists.`);
    }

    return this.prisma.subject.create({
      data: {
        code,
        name,
        shortName: createSubjectDto.shortName?.trim(),
        description: createSubjectDto.description?.trim(),
        category: createSubjectDto.category?.trim(),
        isActive: createSubjectDto.isActive ?? true,
      },
    });
  }

  async findAll() {
    return this.prisma.subject.findMany({
      orderBy: [{ isActive: 'desc' }, { name: 'asc' }],
    });
  }

  async findActive() {
    return this.prisma.subject.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });
  }

  async findByCode(code: string) {
    const subject = await this.prisma.subject.findUnique({
      where: {
        code: code.toUpperCase(),
      },
    });

    if (!subject) {
      throw new NotFoundException('Subject not found.');
    }

    return subject;
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

  async update(id: number, dto: UpdateSubjectDto) {
    await this.findOne(id);

    return this.prisma.subject.update({
      where: { id },
      data: {
        code: dto.code?.toUpperCase(),
        name: dto.name,
        shortName: dto.shortName,
        description: dto.description,
        category: dto.category,
        isActive: dto.isActive,
      },
    });
  }

  async activate(id: number) {
    await this.findOne(id);

    return this.prisma.subject.update({
      where: { id },
      data: {
        isActive: true,
      },
    });
  }

  async deactivate(id: number) {
    await this.findOne(id);

    return this.prisma.subject.update({
      where: { id },
      data: {
        isActive: false,
      },
    });
  }

  async remove(id: number) {
    await this.findOne(id);

    await this.prisma.subject.delete({
      where: { id },
    });

    return {
      message: 'Subject deleted successfully.',
    };
  }
}
