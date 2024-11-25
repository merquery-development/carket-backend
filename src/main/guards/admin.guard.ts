import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { AuthService } from '../services/auth.service';
import { VendorService } from '../services/vendor.service';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(
    private readonly authService: AuthService,
    private readonly vendorService: VendorService,
    private jwtService: JwtService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = request.headers.authorization?.split(' ')[1];

    if (!token) {
      throw new ForbiddenException('No token provided');
    }

    try {
      // Decode token
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.ACCESS_TOKEN_SECRET,
      });
      request['vendor'] = payload;
      // ตรวจสอบว่า role เป็น "admin" และเป็นของ vendor
      const profile = await this.authService.getProfile(token);
      if (!profile) {
        throw new HttpException('Profile not found', HttpStatus.UNAUTHORIZED);
      }

      // Check if the vendor's role is admin
      const vendor = await this.vendorService.getVendorByRoleUid(
        profile.uid,
        'admin',
      );
      if (!vendor) {
        throw new ForbiddenException('User is not an admin');
      }
      if (!vendor.isEnable) {
        throw new UnauthorizedException('vendor is not enabled ');
      }

      return true;
    } catch (error) {
      throw new ForbiddenException('Invalid token or insufficient permissions');
    }
  }
}
