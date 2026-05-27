import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  Request,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';

import { InternalGuard } from '../auth/internal.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles, UserRole } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';

import { UpdateProfileDto } from './dto/update-profile.dto';
import { UserService } from './user.service';

@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}

  @Get('health')
  health() {
    return { status: 'ok', service: 'user-service', timestamp: new Date().toISOString() };
  }

  @Get('search')
  @UseGuards(JwtAuthGuard)
  search(@Query('name') name: string) {
    return this.userService.searchByName(name || '');
  }

  @Post('batch')
  @UseGuards(JwtAuthGuard)
  findByIds(@Body('userIds') userIds: string[]) {
    return this.userService.findByIds(userIds ?? []);
  }

  /** Internal endpoint — called by other microservices (no JWT, uses x-service-secret) */
  @Post('internal/batch')
  @UseGuards(InternalGuard)
  findByIdsInternal(@Body('userIds') userIds: string[]) {
    return this.userService.findByIds(userIds ?? []);
  }

  @Get('email/:email')
  @UseGuards(JwtAuthGuard)
  findByEmail(@Param('email') email: string) {
    return this.userService.findByEmail(email);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  findAll(@Query('skip') skip?: string, @Query('take') take?: string) {
    return this.userService.findAll(skip ? parseInt(skip, 10) : 0, take ? parseInt(take, 10) : 50);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findById(@Param('id') id: string) {
    return this.userService.findById(id);
  }

  @Patch(':id/profile')
  @UseGuards(JwtAuthGuard)
  updateProfile(@Request() req, @Param('id') id: string, @Body() dto: UpdateProfileDto) {
    const requesterId = req.user.sub;
    const requesterRole = req.user.role;

    if (requesterId !== id && requesterRole !== UserRole.ADMIN) {
      throw new ForbiddenException('Bạn không có quyền sửa profile này');
    }

    return this.userService.updateProfile(id, dto);
  }
}
