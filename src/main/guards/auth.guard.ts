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
import { VendorService } from '../services/vendor.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly authService: AuthService,
    private readonly vendorService: VendorService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException('token not found');
    }
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.ACCESS_TOKEN_SECRET,
      });
      // 💡 We're assigning the payload to the request object here
      // so that we can access it in our route handlers
 
      
      request['vendor'] = payload;
    } catch {
      throw new UnauthorizedException('invalid token');
    }
    
  
    const profile = await this.authService.getProfile(token);
    if (!profile) {
      throw new HttpException('Profile not found', HttpStatus.UNAUTHORIZED);
    }

   
    const user = await this.vendorService.getVendorByid(profile.id).catch(error => {
      throw new UnauthorizedException('Authguard error',error.message)
    });   
    
    if (!user || !user.isEnable) {
      throw new UnauthorizedException('User is not enabled');
    } 
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
