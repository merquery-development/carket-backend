import {
  forwardRef,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma.service';
import { CreateVendorUserDto } from '../utils/dto/vendor.dto';
import { firstPartUid, getPagination } from '../utils/pagination';
import { AuthService } from './auth.service';
import { MailerService } from './mailer.service';
@Injectable()
export class VendorService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(forwardRef(() => MailerService))
    private readonly mailerService: MailerService,
    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService,
  ) {}
  async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return await bcrypt.hash(password, saltRounds);
  }

  async getVendors({
    page = null,
    pageSize = null,
    name,
    sortBy = 'createdAt', // Default sort field
    sortOrder = 'asc', // Default sort order
  }: {
    page?: number | null;
    pageSize?: number | null;
    name?: string;
    sortBy?: string; // Field to sort by
    sortOrder?: 'asc' | 'desc'; // Sort direction
  }) {
    const { skip, take } = getPagination(page, pageSize);
    const where = {
      users: {
        some: { isEmailVerified: true }, // Ensure at least one verified user
      },
      ...(name ? { name: { contains: name } } : {}), // Conditionally add username filter
    };

    const [vendor, total] = await Promise.all([
      this.prisma.vendor.findMany({
        skip,
        take,
        where,
        orderBy: {
          [sortBy]: sortOrder, // Dynamic sort field and direction
        },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          address: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      this.prisma.vendor.count({
        where,
      }),
    ]);

    try {
      const data = {
        vendor,
        total,
        page: page || 1,
        pageSize: pageSize || total, // Set pageSize to total if null, showing all records
      };

      return data;
    } catch (error) {
      throw new HttpException(error, HttpStatus.NOT_FOUND);
    }
  }
  async createVendorUser(createVendorUser: CreateVendorUserDto) {
    try {
      let hashedPassword;
      const existVendorUsername = await this.getVendorByName(
        createVendorUser.username,
      );
      const existVendorEmail = await this.getVendorByEmail(
        createVendorUser.email,
      );
      if (existVendorUsername || existVendorEmail) {
        throw new HttpException('User already exist', HttpStatus.BAD_REQUEST);
      }
      const uid = firstPartUid();
      // ตรวจสอบว่ามี password หรือไม่ ถ้ามีก็ทำการ hash
      if (createVendorUser.password) {
        hashedPassword = await this.hashPassword(createVendorUser.password);
      }

      const result = await this.prisma.vendorUser.create({
        data: {
          vendorId: createVendorUser.vendorId, // vendorId จะเป็น null หากมาจาก OAuth
          uid: uid,
          username: createVendorUser.username || null, // username อาจเป็น null หากเป็น OAuth
          email: createVendorUser.email, // email ต้องมาจาก OAuth หรือการลงทะเบียนปกติ
          firstName: createVendorUser.firstname,
          lastName: createVendorUser.lastname || null,
          password: hashedPassword || null, // password เป็น null ถ้าเป็น OAuth user
          roleId: createVendorUser.roleId,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });
      const verificationToken = await this.authService.generateEmailVerificationToken(result.uid);

      // Send verification email
      await this.mailerService.sendVerificationEmail(
        result.email,
        verificationToken,
      );
      if (!result) {
        throw new HttpException(
          'Error while creating vendor user',
          HttpStatus.BAD_REQUEST,
        );
      }

      return { message: 'User created successfully' };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
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

    return result;
  }
  async getVendorByEmail(email: string) {
    const result = this.prisma.vendorUser.findFirst({
      where: {
        email: email,
      },
    });

    return result;
  }

  async updateLastLogin(uid: string) {
    try {
      await this.prisma.vendorUser.update({
        where: { uid: uid },
        data: { lastLogin: new Date() },
      });
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }

  async getVendorByuid(uid: string) {
    const result = await this.prisma.vendorUser.findFirst({
      where: {
        uid: uid,
      },
      select : {
        id: true,
        uid : true,
        vendorId :true,
        username : true,
        email : true,
        isEmailVerified : true,
        mobileNumber : true,
        lastLogin : true,
        nickName : true,
        firstName : true,
        lastName : true,
        profilePicturePath : true,
        profilePictureName : true,
        isEnable : true,
        roleId : true,
        createdAt :true,
        updatedAt : true
      }
    });
    if (!result) {
      throw new HttpException('vendor not found', HttpStatus.NOT_FOUND);
    }
    return result;
  }
  async verifyEmail(uuid: string) {
    console.log(uuid);
    
    const user = await this.prisma.vendorUser.update({
      where: {
        uid: uuid,
      },
      data: {
        isEmailVerified: true,
      },
    });
    if (!user) {
      throw new Error('User not found');
    }

    return { message: 'update successfull' };
  }

  async getRoleByVendorUid(uuid: string, roleName: string) {
    const user = await this.prisma.vendorUser.findFirst({
      where: {
        uid: uuid,
        role: {
          name: roleName,
        },
      },
    });
    return user;
  }
  async updateVendorBanner(
    vendorId: number,
    pictureName: string,
    picturePath: string,
  ) {
    await this.prisma.vendorBanner.create({
      data: {
        vendorId,
        imageName: '/' + pictureName,
        imagePath: '/' + picturePath,
      },
    });
  }
}
