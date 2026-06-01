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
  // Khoi tao lop va nhan cac dependency can thiet qua dependency injection de xu ly nghiep vu.
  constructor(private userService: UserService) {}

  @Get('health')
  // Tra trang thai song cua service de Docker, Caddy hoac GitHub Actions co the kiem tra he thong.
  health() {
    return { status: 'ok', service: 'user-service', timestamp: new Date().toISOString() };
  }

  @Get('search')
  @UseGuards(JwtAuthGuard)
  // Tim vector gan nhat trong Qdrant theo collection, filter va nguong diem.
  search(@Query('name') name: string) {
    return this.userService.searchByName(name || '');
  }

  @Post('batch')
  @UseGuards(JwtAuthGuard)
  // Lay nhieu user theo danh sach id, dung cho hydrate du lieu hoi thoai hoac ban be.
  findByIds(@Body('userIds') userIds: string[]) {
    return this.userService.findByIds(userIds ?? []);
  }

  // Endpoint noi bo cho microservice khac goi, khong dung JWT va xac thuc bang x-service-secret.
  @Post('internal/batch')
  @UseGuards(InternalGuard)
  // Truy van du lieu user-service theo tham so dau vao va tra ket qua cho controller hoac service goi toi.
  findByIdsInternal(@Body('userIds') userIds: string[]) {
    return this.userService.findByIds(userIds ?? []);
  }

  @Get('email/:email')
  @UseGuards(JwtAuthGuard)
  // Tim user theo email va nem loi neu khong ton tai.
  findByEmail(@Param('email') email: string) {
    return this.userService.findByEmail(email);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  // Lay danh sach user co phan trang don gian cho man hinh quan tri hoac debug.
  findAll(@Query('skip') skip?: string, @Query('take') take?: string) {
    return this.userService.findAll(skip ? parseInt(skip, 10) : 0, take ? parseInt(take, 10) : 50);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  // Tim user theo id va nem loi neu khong ton tai.
  findById(@Param('id') id: string) {
    return this.userService.findById(id);
  }

  @Patch(':id/profile')
  @UseGuards(JwtAuthGuard)
  // Cap nhat ho so ca nhan, xu ly avatar cu va phat event profile updated cho service khac.
  updateProfile(@Request() req, @Param('id') id: string, @Body() dto: UpdateProfileDto) {
    const requesterId = req.user.sub;
    const requesterRole = req.user.role;

    if (requesterId !== id && requesterRole !== UserRole.ADMIN) {
      throw new ForbiddenException('Bạn không có quyền sửa profile này');
    }

    return this.userService.updateProfile(id, dto);
  }
}
