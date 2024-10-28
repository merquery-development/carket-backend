import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { Request } from 'express';
import { AuthService } from '../services/auth.service';
import { CustomerService } from '../services/customer.service';
import { log } from 'console';

@Injectable()
export class CustomerOrGuestGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly authService: AuthService,
    private readonly customerService: CustomerService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);


    if (!token) {
      // If no token, the user is a guest
      request['isGuest'] = true;
      return true; // Allow guest access
    }

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.ACCESS_TOKEN_SECRET,
      });
      request['customer'] = payload;
    } catch {
      throw new UnauthorizedException('invalid token');
    }

    const profile = await this.authService.getProfile(token);
    if (!profile) {
      throw new HttpException('Profile not found', HttpStatus.UNAUTHORIZED);
    }

    const user = await this.customerService
      .getCustomerByUid(profile.uid)
      .catch((error) => {
        throw new UnauthorizedException('Authguard error', error.message);
      });

    if (!user || !user.isEnable) {
      throw new UnauthorizedException('User is not enabled');
    }

    request['isGuest'] = false;
    return true; // Allow customer access
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
