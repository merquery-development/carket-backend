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
import * as jwt from 'jsonwebtoken';
import { CustomerService } from './customer.service';
import { VendorService } from './vendor.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    @Inject(forwardRef(() => VendorService))
    private readonly vendorService: VendorService,
    @Inject(forwardRef(() => CustomerService))
    private readonly customerService: CustomerService,
  ) {}
  async generateEmailVerificationToken(userId: string) {
    const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
      expiresIn: '1d', // token expires in 1 day
    });
    return token;
  }
  async signInVendor(identifier: string, pass: string) {
    let vendor;

    // ตรวจสอบว่า identifier มีเครื่องหมาย '@' หรือไม่
    if (identifier.includes('@')) {
      // ถ้ามี '@' ให้ถือว่าเป็น email
      vendor = await this.vendorService.getVendorByEmail(identifier);
    } else {
      // ถ้าไม่มี '@' ให้ถือว่าเป็น username
      vendor = await this.vendorService.getVendorByName(identifier);
    }
    if (!vendor) {
      throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
    }

    
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

    await this.vendorService.updateLastLogin(vendor.uid);
    const payload = {
      uid: vendor.uid,
      username: vendor.username,
      email: vendor.email,
    };
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
  async signInCustomer(identifier: string, pass: string) {
    let customer;

    // ตรวจสอบว่า identifier มีเครื่องหมาย '@' หรือไม่
    if (identifier.includes('@')) {
      // ถ้ามี '@' ให้ถือว่าเป็น email
      customer = await this.customerService.getCustomerByEmail(identifier);
    } else {
      // ถ้าไม่มี '@' ให้ถือว่าเป็น username
      customer = await this.customerService.getCustomerByName(identifier);
    }
    if (!customer) {
      throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
    }

    
    if (!customer.isEnable) {
      throw new UnauthorizedException('User is not enabled');
    }

    if (!customer) {
      throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
    }
    if (isHashedPassword(pass)) {
      throw new HttpException(
        'Can not use hash password to login',
        HttpStatus.UNAUTHORIZED,
      );
    }
    const match = await isMatch(pass, customer.password);

    if (!match) {
      throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
    }

    await this.vendorService.updateLastLogin(customer.uid);
    const payload = {
      uid: customer.uid,
      username: customer.username,
      email: customer.email,
    };
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
      const vendor = await this.vendorService.getVendorByuid(decoded.uid);
      if (!vendor) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      // ตรวจสอบเวลาที่ล็อกอินล่าสุด
      const now = new Date();

      const lastLogin = new Date(vendor.lastLogin);

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
  async googleLogin(req) {
    if (!req.user) {
      return 'No user from google';
    }
    // ตรวจสอบว่าผู้ใช้นี้มาจาก OAuth หรือไม่
    const oauthUserData = req.user || {}; // ข้อมูลจาก OAuth
    const oauthType = 'Google';
    await this.customerService.createCustomer({
      username: req.user.username || null, // username อาจเป็น null
      firstname: req.user.firstname,
      lastname: req.user.lastname || null,
      email: req.user.email, // รับค่า email จาก OAuth
      password: null, // ไม่ต้องมี password ในกรณีของ OAuth

      isOauth: true, // ระบุว่าเป็น OAuth user
      oauthType: oauthType,
      oauthUserData: oauthUserData,
      updateAt: new Date(),
    });
    return {
      message: 'User information from Google',
      user: req.user,
    };
  }

  async facebookLogin(req) {
    if (!req.user) {
      return 'No user from facebook';
    }
    const oauthUserData = req.user || {}; // ข้อมูลจาก OAuth
    const oauthType = 'Facebook';

    await this.customerService.createCustomer({
      username: req.user.username || null, // username อาจเป็น null
      firstname: req.user.firstname,
      lastname: req.user.lastname || null,
      email: req.user.email, // รับค่า email จาก OAuth
      password: null, // ไม่ต้องมี password ในกรณีของ OAuth

      isOauth: true, // ระบุว่าเป็น OAuth user
      oauthType: oauthType,
      oauthUserData: oauthUserData,
      updateAt: new Date(),
    });
    return {
      message: 'User information from Facebook',
      user: req.user,
    };
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
