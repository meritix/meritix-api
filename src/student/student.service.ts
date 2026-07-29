import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { generateMeritixId } from './utils/generate-meritix-id';

@Injectable()
export class StudentService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: number, createStudentDto: CreateStudentDto) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found.');
    }

    const existingProfile = await this.prisma.studentProfile.findUnique({
      where: {
        userId,
      },
    });

    if (existingProfile) {
      throw new ConflictException(
        'Student profile already exists for this user.',
      );
    }

    const lastStudent = await this.prisma.studentProfile.findFirst({
      orderBy: {
        id: 'desc',
      },
    });

    const meritixId = generateMeritixId(lastStudent?.id ?? 0);

    return this.prisma.studentProfile.create({
      data: {
        userId,
        meritixId,
        ...createStudentDto,
        dob: createStudentDto.dob ? new Date(createStudentDto.dob) : undefined,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            createdAt: true,
          },
        },
      },
    });
  }

  async findAll() {
    return this.prisma.studentProfile.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });
  }

  async findMe(userId: number) {
    const student = await this.prisma.studentProfile.findUnique({
      where: {
        userId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            createdAt: true,
          },
        },
      },
    });

    if (!student) {
      throw new NotFoundException(
        'Student profile not found for the logged-in user.',
      );
    }

    return student;
  }

  async findByMeritixId(meritixId: string) {
    const student = await this.prisma.studentProfile.findUnique({
      where: {
        meritixId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });

    if (!student) {
      throw new NotFoundException(
        `Student with Meritix ID ${meritixId} not found.`,
      );
    }

    return student;
  }

  async findOne(id: number) {
    const student = await this.prisma.studentProfile.findUnique({
      where: {
        id,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });

    if (!student) {
      throw new NotFoundException(`Student profile with ID ${id} not found.`);
    }

    return student;
  }

  async update(id: number, updateStudentDto: UpdateStudentDto) {
    await this.findOne(id);

    return this.prisma.studentProfile.update({
      where: {
        id,
      },
      data: {
        ...updateStudentDto,
        dob: updateStudentDto.dob ? new Date(updateStudentDto.dob) : undefined,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });
  }

  async remove(id: number) {
    await this.findOne(id);

    await this.prisma.studentProfile.delete({
      where: {
        id,
      },
    });

    return {
      message: 'Student profile deleted successfully.',
    };
  }
}
