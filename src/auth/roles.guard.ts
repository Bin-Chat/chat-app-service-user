import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { ROLES_KEY, UserRole } from './roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  // Khoi tao lop va nhan cac dependency can thiet qua dependency injection de xu ly nghiep vu.
  constructor(private reflector: Reflector) {}

  // Kiem tra request co du quyen di tiep hay khong; tra true neu hop le va nem loi khi bi tu choi.
  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    if (!requiredRoles.includes(user?.role)) {
      throw new ForbiddenException('Bạn không có quyền thực hiện hành động này');
    }
    return true;
  }
}
