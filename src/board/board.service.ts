import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBoardDto } from './dto/create-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';

@Injectable()
export class BoardService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createBoardDto: CreateBoardDto) {
    const code = createBoardDto.code.trim().toUpperCase();
    const name = createBoardDto.name.trim();

    const existingCode = await this.prisma.board.findUnique({
      where: {
        code,
      },
    });

    if (existingCode) {
      throw new ConflictException(`Board with code ${code} already exists.`);
    }

    const existingName = await this.prisma.board.findUnique({
      where: {
        name,
      },
    });

    if (existingName) {
      throw new ConflictException(`Board with name ${name} already exists.`);
    }

    return this.prisma.board.create({
      data: {
        code,
        name,
        description: createBoardDto.description?.trim(),
        website: createBoardDto.website?.trim(),
        country: createBoardDto.country?.trim() || 'India',
        isActive: createBoardDto.isActive ?? true,
      },
    });
  }

  async findAll() {
    return this.prisma.board.findMany({
      orderBy: [
        {
          isActive: 'desc',
        },
        {
          name: 'asc',
        },
      ],
    });
  }

  async findActive() {
    return this.prisma.board.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        name: 'asc',
      },
    });
  }

  async findByCode(code: string) {
    const normalizedCode = code.trim().toUpperCase();

    const board = await this.prisma.board.findUnique({
      where: {
        code: normalizedCode,
      },
    });

    if (!board) {
      throw new NotFoundException(
        `Board with code ${normalizedCode} was not found.`,
      );
    }

    return board;
  }

  async findOne(id: number) {
    const board = await this.prisma.board.findUnique({
      where: {
        id,
      },
    });

    if (!board) {
      throw new NotFoundException(`Board with ID ${id} was not found.`);
    }

    return board;
  }

  async update(id: number, updateBoardDto: UpdateBoardDto) {
    const existingBoard = await this.findOne(id);

    const code = updateBoardDto.code
      ? updateBoardDto.code.trim().toUpperCase()
      : existingBoard.code;

    const name = updateBoardDto.name
      ? updateBoardDto.name.trim()
      : existingBoard.name;

    if (code !== existingBoard.code) {
      const duplicateCode = await this.prisma.board.findUnique({
        where: {
          code,
        },
      });

      if (duplicateCode) {
        throw new ConflictException(`Board with code ${code} already exists.`);
      }
    }

    if (name !== existingBoard.name) {
      const duplicateName = await this.prisma.board.findUnique({
        where: {
          name,
        },
      });

      if (duplicateName) {
        throw new ConflictException(`Board with name ${name} already exists.`);
      }
    }

    return this.prisma.board.update({
      where: {
        id,
      },
      data: {
        code,
        name,
        description:
          updateBoardDto.description !== undefined
            ? updateBoardDto.description.trim()
            : undefined,
        website:
          updateBoardDto.website !== undefined
            ? updateBoardDto.website.trim()
            : undefined,
        country:
          updateBoardDto.country !== undefined
            ? updateBoardDto.country.trim()
            : undefined,
        isActive: updateBoardDto.isActive,
      },
    });
  }

  async activate(id: number) {
    await this.findOne(id);

    return this.prisma.board.update({
      where: {
        id,
      },
      data: {
        isActive: true,
      },
    });
  }

  async deactivate(id: number) {
    await this.findOne(id);

    return this.prisma.board.update({
      where: {
        id,
      },
      data: {
        isActive: false,
      },
    });
  }

  async remove(id: number) {
    await this.findOne(id);

    await this.prisma.board.delete({
      where: {
        id,
      },
    });

    return {
      message: 'Board deleted successfully.',
    };
  }
}
