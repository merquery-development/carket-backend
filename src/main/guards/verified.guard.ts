import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { Request } from 'express';
import { AuthService } from '../services/auth.service';
@Injectable()
export class EmailVerifiedGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}
  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    const user = await this.authService.getProfile(token);
    console.log(user);
    

    if (!user.verified) {
      throw new HttpException(
        'Please verify your email before proceeding.',
        HttpStatus.FORBIDDEN,
      );
    }

    return true;
  }
  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
