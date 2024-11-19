import { Injectable, CanActivate, ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';

@Injectable()
export class EmailVerifiedGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user.isEmailVerified) {
      throw new HttpException('Please verify your email before proceeding.', HttpStatus.FORBIDDEN);
    }

    return true;
  }
}