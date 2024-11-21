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
      request['role'] = 'guest';
      return true; // Allow guest access
    }

    let payload;
    try {
      payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.ACCESS_TOKEN_SECRET,
      });
   
    } catch {
      throw new UnauthorizedException('Invalid token');
    }

    const profile = await this.authService.getProfile(token);
    if (!profile) {
      throw new HttpException('Profile not found', HttpStatus.UNAUTHORIZED);
    }

    // Handle vendorUser, customer, or unauthorized users
    const userRole = await this.determineUserRole(profile);
    if (!userRole) {
      throw new UnauthorizedException('User role not recognized');
    }

    request['role'] = userRole; // 'vendorUser', 'customer', or 'guest'
    request['userProfile'] = profile;

    if (userRole === 'customer') {
      const customer = await this.customerService
        .getCustomerByUid(profile.customeruid)
        .catch((error) => {
          throw new UnauthorizedException('Authguard error', error.message);
        });

      if (!customer || !customer.isEnable) {
        throw new UnauthorizedException('Customer is not enabled');
      }
    }

    return true; // Allow access based on role
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }

  private async determineUserRole(
    profile: any,
  ): Promise<'vendorUser' | 'customer' | 'guest' | null> {
    if (profile.vendoruid) {
      return 'vendorUser';
    } else if (profile.customeruid) {
      return 'customer';
    } else {
      return null; // Role not recognized
    }
  }
}
