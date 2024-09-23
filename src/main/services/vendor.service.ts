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
    const hashedPassword = await this.hashPassword(createVendorUser.password);
    const result = await this.prisma.vendorUser.create({
      data: {
        vendorId: createVendorUser.vendorId,
        username: createVendorUser.username, // ตรวจสอบชื่อ field ว่าตรงกับ schema Prisma หรือไม่
        email: createVendorUser.email,
        password: hashedPassword,
        roleId: createVendorUser.roleId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    if (!result) {
      throw new HttpException(
        'Error while create vendor',
        HttpStatus.BAD_REQUEST,
      );
    }
    return { message: 'create successfull' };
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

  async getVendorByid(id: number) {
    const result = await this.prisma.vendorUser.findFirst({
      where: {
        id: id,
      },
    });
    if (!result) {
      throw new HttpException('vendor not found', HttpStatus.NOT_FOUND);
    }
    return result;
  }
}
