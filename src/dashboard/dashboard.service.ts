import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async summary() {
    const [
      boards,
      schools,
      classes,
      sections,
      users,
      activeSchools,
      activeClasses,
      activeSections,
    ] = await Promise.all([
      this.prisma.board.count(),
      this.prisma.school.count(),
      this.prisma.class.count(),
      this.prisma.section.count(),
      this.prisma.user.count(),

      this.prisma.school.count({
        where: { isActive: true },
      }),

      this.prisma.class.count({
        where: { isActive: true },
      }),

      this.prisma.section.count({
        where: { isActive: true },
      }),
    ]);

    return {
      boards,
      schools,
      classes,
      sections,
      users,
      activeSchools,
      activeClasses,
      activeSections,
    };
  }

  async recentSchools() {
    return this.prisma.school.findMany({
      take: 5,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        board: true,
      },
    });
  }

  async recentClasses() {
    return this.prisma.class.findMany({
      take: 5,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        school: true,
      },
    });
  }

  async recentSections() {
    return this.prisma.section.findMany({
      take: 5,
      orderBy: {
        createdAt: 'desc',
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
}