import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma.service';
import { CreateCustomerDto } from '../utils/dto/customer.dto';
import { firstPartUid } from '../utils/pagination';
@Injectable()
export class CustomerService {
  constructor(private readonly prisma: PrismaService) {}
  async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return await bcrypt.hash(password, saltRounds);
  }
  async createCustomer(createCustomerDto: CreateCustomerDto) {
    let hashedPassword;
    const uid = firstPartUid();
    // ตรวจสอบว่ามี password หรือไม่ ถ้ามีก็ทำการ hash
    if (createCustomerDto.password) {
      hashedPassword = await this.hashPassword(createCustomerDto.password);
    }

    const result = await this.prisma.customer.create({
      data: {
        username: createCustomerDto.username || null, // username อาจเป็น null หากเป็น OAuth
        email: createCustomerDto.email, // email ต้องมาจาก OAuth หรือการลงทะเบียนปกติ
        uid: uid,
        firstName: createCustomerDto.firstname,
        lastName: createCustomerDto.lastname || null,
        password: hashedPassword || null, // password เป็น null ถ้าเป็น OAuth user
        isOauth: createCustomerDto.isOauth || false, // กำหนดว่าเป็นผู้ใช้ OAuth หรือไม่
        oauthType: createCustomerDto.oauthType || null, // เก็บประเภท OAuth เช่น Google
        oauthUserData: createCustomerDto.oauthUserData || {}, // ข้อมูล OAuth ที่ได้รับ
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    if (!result) {
      throw new HttpException(
        'Error while creating customer ',
        HttpStatus.BAD_REQUEST,
      );
    }

    return { message: 'Customer created successfully' };
  }
  async getCustomerByName(username: string) {
    const result = await this.prisma.customer.findFirst({
      where: {
        username: username,
      },
    });

    return result;
  }
  async getCustomerByEmail(email: string) {
    const result = this.prisma.customer.findFirst({
      where: {
        email: email,
      },
    });

    return result;
  }
  async updateLastLoginCustomer(uid: string) {
    try {
      await this.prisma.customer.update({
        where: { uid: uid },
        data: { lastLogin: new Date() },
      });
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }
  async getCustomerByUid(uid: string){
    const result = await this.prisma.customer.findFirst({
      where: {
        uid: uid,
      },
    });
    if (!result) {
      throw new HttpException('vendor not found', HttpStatus.NOT_FOUND);
    }
    return result;
  }
}
