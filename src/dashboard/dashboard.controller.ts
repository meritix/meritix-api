import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { DashboardService } from './dashboard.service';

@Controller('dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(
    private readonly dashboardService: DashboardService,
  ) {}

  @Get('summary')
  summary() {
    return this.dashboardService.summary();
  }

  @Get('recent-schools')
  recentSchools() {
    return this.dashboardService.recentSchools();
  }

  @Get('recent-classes')
  recentClasses() {
    return this.dashboardService.recentClasses();
  }

  @Get('recent-sections')
  recentSections() {
    return this.dashboardService.recentSections();
  }
}