import {
  forwardRef,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma.service';
import { CreateVendorUserDto } from '../utils/vendor.dto';
import { AuthService } from './auth.service';
@Injectable()
export class VendorService {
  constructor(
    private readonly prisma: PrismaService,

  ) {}
  async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return await bcrypt.hash(password, saltRounds);
  }
  async createVendorUser(createVendorUser: CreateVendorUserDto) {
    let hashedPassword;

    // ตรวจสอบว่ามี password หรือไม่ ถ้ามีก็ทำการ hash
    if (createVendorUser.password) {
      hashedPassword = await this.hashPassword(createVendorUser.password);
    }


    const result = await this.prisma.vendorUser.create({
      data: {
        vendorId: createVendorUser.vendorId , // vendorId จะเป็น null หากมาจาก OAuth
        username: createVendorUser.username || null, // username อาจเป็น null หากเป็น OAuth
        email: createVendorUser.email, // email ต้องมาจาก OAuth หรือการลงทะเบียนปกติ
        firstName: createVendorUser.firstname ,
        lastName : createVendorUser.lastname || null,
        password: hashedPassword || null, // password เป็น null ถ้าเป็น OAuth user
        roleId: createVendorUser.roleId,
        isOauth: createVendorUser.isOauth || false, // กำหนดว่าเป็นผู้ใช้ OAuth หรือไม่
        oauthType: createVendorUser.oauthType || null, // เก็บประเภท OAuth เช่น Google
        oauthUserData: createVendorUser.oauthUserData || {}, // ข้อมูล OAuth ที่ได้รับ
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    if (!result) {
      throw new HttpException(
        'Error while creating vendor user',
        HttpStatus.BAD_REQUEST,
      );
    }

    return { message: 'User created successfully' };
  }
  catch(error) {
    throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
  }

  async getVendorByName(username: string) {
    const result = await this.prisma.vendorUser.findFirst({
      where: {
        username: username,
      },
    });
    if (!result) {
      throw new HttpException('vendor not found', HttpStatus.NOT_FOUND);
    }
    return result;
  }

  async updateLastLogin(id: number) {
    try {
      await this.prisma.vendorUser.update({
        where: { id: id },
        data: { lastLogin: new Date() },
      });
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }

  async getVendorByid(id: string) {
    const result = await this.prisma.vendorUser.findFirst({
      where: {
        id: Number(id),
      },
    });
    if (!result) {
      throw new HttpException('vendor not found', HttpStatus.NOT_FOUND);
    }
    return result;
  }
}
