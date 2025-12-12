import { Injectable, CanActivate, ExecutionContext, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { Inject, forwardRef } from '@nestjs/common';
import { UsersService } from '../../users/users.service';

@Injectable()
export class AdminAuthGuard implements CanActivate {
  constructor(
    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    
    // Check if user is authenticated (JWT token exists and was validated by JwtAuthGuard)
    if (!request.user || !request.user.id) {
      throw new UnauthorizedException('Authentication required');
    }

    const user = await this.usersService.findById(request.user.id);

    if (!user) {
      throw new ForbiddenException('User not found');
    }

    if (user.role !== 'ADMIN') {
      throw new ForbiddenException('Admin access required');
    }

    return true;
  }
}

