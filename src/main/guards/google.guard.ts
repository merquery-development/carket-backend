import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import axios from 'axios';
import { Request } from 'express';

@Injectable()
export class GoogleAuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest();
    const authHeader = request.headers['authorization'];

    if (!authHeader) {
      throw new HttpException('No token provided', HttpStatus.UNAUTHORIZED);
    }

    const token = authHeader.split(' ')[1]; // Bearer YOUR_ACCESS_TOKEN
    try {
      // ตรวจสอบ Access Token กับ Google
      const response = await axios.get(
        `https://www.googleapis.com/oauth2/v3/tokeninfo?access_token=${token}`,
      );

      // ตรวจสอบข้อมูลเพิ่มเติม เช่น email, scope, หรือ expiry
      if (!response.data || !response.data.email_verified) {
        throw new HttpException(
          'Invalid token or email not verified',
          HttpStatus.UNAUTHORIZED,
        );
      }

      // แนบข้อมูล user ไปยัง request
      request['googleUser'] = response.data;
      return true;
    } catch (error) {
      throw new HttpException(
        'Invalid or expired token',
        HttpStatus.UNAUTHORIZED,
      );
    }
  }
}
