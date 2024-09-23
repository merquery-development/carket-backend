import {
  forwardRef,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { VendorService } from './vendor.service';
@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    @Inject(forwardRef(() => VendorService))
    private readonly vendorService: VendorService,
  ) {}

  async signIn(username: string, pass: string) {
    const vendor = await this.vendorService
      .getVendorByName(username)
      .catch((error) => {
        throw new HttpException('getVendorusername error', error.message);
      });
    if (!vendor.isEnable) {
      throw new UnauthorizedException('User is not enabled');
    }

    if (!vendor) {
      throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
    }
    if (isHashedPassword(pass)) {
      throw new HttpException(
        'Can not use hash password to login',
        HttpStatus.UNAUTHORIZED,
      );
    }
    const match = await isMatch(pass, vendor.password);

    if (!match) {
      throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
    }

    await this.vendorService.updateLastLogin(vendor.id);
    const payload = { uid: vendor.id, username: vendor.username };
    const accessToken = this.jwtService.sign(payload, {
      secret: process.env.ACCESS_TOKEN_SECRET,
      expiresIn: '15m',
    });
    const refreshToken = this.jwtService.sign(payload, {
      secret: process.env.REFRESH_TOKEN_SECRET,
      expiresIn: '1d',
    });
    return {
      accessToken,
      refreshToken,
    };
  }
  async refresh(refreshToken: string) {
    try {
      // ตรวจสอบ Refresh Token
      const decoded = await this.jwtService.verifyAsync(refreshToken, {
        secret: process.env.REFRESH_TOKEN_SECRET,
      });

      // ตรวจสอบว่า Refresh Token ถูกต้อง
      const staff = await this.vendorService.getVendorByid(decoded.id);
      if (!staff) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      // ตรวจสอบเวลาที่ล็อกอินล่าสุด
      const now = new Date();

      const lastLogin = new Date(staff.lastLogin);

      // ตรวจสอบว่าการล็อกอินล่าสุดอยู่ในช่วงเวลาที่ Refresh Token ถูกต้อง
      const tokenValidPeriod = 24 * 60 * 60 * 1000; // 24 ชั่วโมง

      if (now.getTime() - lastLogin.getTime() > tokenValidPeriod) {
        //เวลาตอนนี้-เวลาล็อคอินมากกว่า 24 มั้ย
        throw new HttpException(
          "Refresh token expired'",
          HttpStatus.UNAUTHORIZED,
        );
      }

      // สร้าง Access Token และ Refresh Token ใหม่
      const newPayload = { uid: decoded.uid, username: decoded.username };
      const newAccessToken = await this.jwtService.signAsync(newPayload, {
        secret: process.env.ACCESS_TOKEN_SECRET,
        expiresIn: '15m',
      });

      return {
        accessToken: newAccessToken,
        refreshToken,
      };
    } catch (error) {
      throw new HttpException(
        "Invalid refresh token'",
        HttpStatus.UNAUTHORIZED,
      );
    }
  }
  async getProfile(token: string) {
    try {
      const decoded = await this.jwtService.verifyAsync(token, {
        secret: process.env.ACCESS_TOKEN_SECRET,
      });

      return decoded;
    } catch (error) {
      throw new HttpException("Invalid token'", HttpStatus.UNAUTHORIZED);
    }
  }
}
function isHashedPassword(password: string): boolean {
  // bcrypt hashed passwords are 60 characters long and start with '$2a$' or '$2b$'
  const bcryptPattern = /^\$2[ayb]\$.{56}$/;
  return bcryptPattern.test(password);
}

async function isMatch(
  plainPassword: string,
  hashedPassword: string,
): Promise<boolean> {
  try {
    // Compare the plaintext password with the hashed password
    const match = await bcrypt.compare(plainPassword, hashedPassword);
    return match;
  } catch (error) {
    throw new HttpException(error, HttpStatus.FORBIDDEN);
  }
}
