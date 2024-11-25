import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { AuthService } from '../services/auth.service';
import { VendorService } from '../services/vendor.service';
@Injectable()
export class EmailVerifiedGuard implements CanActivate {
  constructor(
    private readonly authService: AuthService,
    private readonly vendorService: VendorService,
  ) {}
  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    const user = await this.authService.getProfile(token);

    if (!user.verified) {
      throw new HttpException(
        'Please verify your email before proceeding.',
        HttpStatus.FORBIDDEN,
      );
    }
    const vendor = await this.vendorService
      .getVendorByuid(user.uid)
      .catch((error) => {
        throw new UnauthorizedException('Authguard error', error.message);
      });

      if (!vendor || !vendor.isEnable) {
        throw new UnauthorizedException('Vendor is not enabled');
      }
    return true;
  }
  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
