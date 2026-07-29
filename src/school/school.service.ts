import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSchoolDto } from './dto/create-school.dto';
import { UpdateSchoolDto } from './dto/update-school.dto';

@Injectable()
export class SchoolService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateSchoolDto) {
    const board = await this.prisma.board.findUnique({
      where: { id: dto.boardId },
    });

    if (!board) {
      throw new NotFoundException('Board not found.');
    }

    const existingCode = await this.prisma.school.findUnique({
      where: { code: dto.code.toUpperCase() },
    });

    if (existingCode) {
      throw new ConflictException('School code already exists.');
    }

    if (dto.udiseCode) {
      const existingUdise = await this.prisma.school.findUnique({
        where: { udiseCode: dto.udiseCode },
      });

      if (existingUdise) {
        throw new ConflictException('UDISE code already exists.');
      }
    }

    return this.prisma.school.create({
      data: {
        code: dto.code.toUpperCase(),
        name: dto.name,
        boardId: dto.boardId,
        udiseCode: dto.udiseCode,
        affiliationNo: dto.affiliationNo,
        principalName: dto.principalName,
        email: dto.email,
        phone: dto.phone,
        website: dto.website,
        address: dto.address,
        city: dto.city,
        state: dto.state,
        country: dto.country ?? 'India',
        pincode: dto.pincode,
        isActive: dto.isActive ?? true,
      },
      include: {
        board: true,
      },
    });
  }

  async findAll() {
    return this.prisma.school.findMany({
      include: {
        board: true,
      },
      orderBy: {
        name: 'asc',
      },
    });
  }

  async findOne(id: number) {
    const school = await this.prisma.school.findUnique({
      where: { id },
      include: {
        board: true,
      },
    });

    if (!school) {
      throw new NotFoundException('School not found.');
    }

    return school;
  }

  async findByCode(code: string) {
    const school = await this.prisma.school.findUnique({
      where: {
        code: code.toUpperCase(),
      },
      include: {
        board: true,
      },
    });

    if (!school) {
      throw new NotFoundException('School not found.');
    }

    return school;
  }

  async findByBoard(boardId: number) {
    return this.prisma.school.findMany({
      where: { boardId },
      include: {
        board: true,
      },
      orderBy: {
        name: 'asc',
      },
    });
  }

  async update(id: number, dto: UpdateSchoolDto) {
    await this.findOne(id);

    return this.prisma.school.update({
      where: { id },
      data: dto,
      include: {
        board: true,
      },
    });
  }

  async activate(id: number) {
    await this.findOne(id);

    return this.prisma.school.update({
      where: { id },
      data: {
        isActive: true,
      },
    });
  }

  async deactivate(id: number) {
    await this.findOne(id);

    return this.prisma.school.update({
      where: { id },
      data: {
        isActive: false,
      },
    });
  }

  async remove(id: number) {
    await this.findOne(id);

    await this.prisma.school.delete({
      where: { id },
    });

    return {
      message: 'School deleted successfully.',
    };
  }
}
