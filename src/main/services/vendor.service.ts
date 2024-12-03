import {
  BadRequestException,
  forwardRef,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma.service';
import {
  CreateVendorDto,
  CreateVendorUserDto,
  UpdateVendorDto,
} from '../utils/dto/vendor.dto';
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

  async getVendorByuid(uid: string) {
    const result = await this.prisma.vendor.findFirst({
      where: {
        uid: uid,
      },
      include: {
        banners: true, // Include related banners
      },
    });
  
    if (!result) {
      throw new HttpException('vendor not found', HttpStatus.NOT_FOUND);
    }
  
    // Modify banners to combine `imagePath` and `imageName`
    const modifiedResult = {
      ...result,
      banners: result.banners.map(banner => ({
        imageUrl: banner.imagePath + banner.imageName, // Combine imagePath and imageName
      })),
    };
  
    return modifiedResult;
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
    if (page !== null && (page <= 0 || !Number.isInteger(page))) {
      throw new BadRequestException('Page must be a positive integer greater than 0');
    }
  
    if (pageSize !== null && (pageSize <= 0 || !Number.isInteger(pageSize))) {
      throw new BadRequestException('PageSize must be a positive integer greater than 0');
    }
  
    const { skip, take } = getPagination(page, pageSize);
    const where = {
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
        include: {
          banners: true, // Include related banners
        },
      }),
      this.prisma.vendor.count({
        where,
      }),
    ]);
  
    // Modify banners to combine `imagePath` and `imageName`
    const modifiedVendors = vendor.map(v => ({
      ...v,
      banners: v.banners.map(banner => ({
        imageUrl: banner.imagePath + banner.imageName, // Combine imagePath and imageName
      })),
    }));
  
    try {
      const data = {
        vendor: modifiedVendors,
        total,
        page: page || 1,
        pageSize: pageSize || total, // Set pageSize to total if null, showing all records
      };
  
      return data;
    } catch (error) {
      throw new HttpException(error, HttpStatus.NOT_FOUND);
    }
  }

  async getVendorUser({
    page = null,
    pageSize = null,
    firstName,
    sortBy = 'createdAt', // Default sort field
    sortOrder = 'asc', // Default sort order
  }: {
    page?: number | null;
    pageSize?: number | null;
    firstName?: string;
    sortBy?: string; // Field to sort by
    sortOrder?: 'asc' | 'desc'; // Sort direction
  }) {
    if (page !== null && (page <= 0 || !Number.isInteger(page))) {
      throw new BadRequestException(
        'Page must be a positive integer greater than 0',
      );
    }

    if (pageSize !== null && (pageSize <= 0 || !Number.isInteger(pageSize))) {
      throw new BadRequestException(
        'PageSize must be a positive integer greater than 0',
      );
    }

    const { skip, take } = getPagination(page, pageSize);
    const where = {
      isEmailVerified : true,
      ...(firstName ? { firstName: { contains: firstName } } : {}), // Conditionally add username filter
    };

    const [vendorUser, total] = await Promise.all([
      this.prisma.vendorUser.findMany({
        skip,
        take,
        where,
        orderBy: {
          [sortBy]: sortOrder, // Dynamic sort field and direction
        },
        select: {
          uid: true,
          username: true,
          vendorId: true,
          email: true,
          isEmailVerified: true,
          mobileNumber: true,
          lastLogin : true,
          nickName : true,
          firstName: true,
          lastName : true,
          profilePicturePath : true,
          profilePictureName : true,
          isEnable : true,
          roleId : true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      this.prisma.vendorUser.count({
        where,
      }),
    ]);

    try {
      const data = {
        vendorUser,
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
      // ตรวจสอบว่าต้องมี username หรือ email อย่างใดอย่างหนึ่ง
      if (!createVendorUser.username && !createVendorUser.email) {
        throw new BadRequestException('Either username or email is required');
      }

      let hashedPassword: string | null = null;
      let existVendorUsername = null;
      let existVendorEmail = null;

      // ตรวจสอบ username และ email ซ้ำซ้อน
      if (createVendorUser.username) {
        existVendorUsername = await this.getVendorByName(
          createVendorUser.username,
        );
      }
      if (createVendorUser.email) {
        existVendorEmail = await this.getVendorByEmail(createVendorUser.email);
      }

      if (existVendorUsername || existVendorEmail) {
        throw new HttpException('User already exists', HttpStatus.BAD_REQUEST);
      }

      const uid = firstPartUid();

      // ตรวจสอบและ hash password (ถ้ามี)
      if (createVendorUser.password) {
        hashedPassword = await this.hashPassword(createVendorUser.password);
      }

      // สร้าง Vendor User
      const result = await this.prisma.vendorUser.create({
        data: {
          vendorId: createVendorUser.vendorId || null, // vendorId อาจเป็น null
          uid: uid,
          username: createVendorUser.username || null, // username อาจเป็น null หากมาจาก OAuth
          email: createVendorUser.email || null,
          firstName: createVendorUser.firstname,
          lastName: createVendorUser.lastname || null,
          password: hashedPassword || null, // password เป็น null ถ้าเป็น OAuth user
          roleId: createVendorUser.roleId,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });

      // สร้าง verification token และส่งอีเมล
      const verificationToken =
        await this.authService.generateEmailVerificationToken(result.uid);

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
      // จัดการข้อผิดพลาด
      throw new HttpException(
        error || 'Unexpected error',
        HttpStatus.BAD_REQUEST,
      );
    }
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

  async getVendorUserByuid(uid: string) {
    const result = await this.prisma.vendorUser.findFirst({
      where: {
        uid: uid,
      },
      select: {
        uid: true,
        vendorId: true,
        username: true,
        email: true,
        isEmailVerified: true,
        mobileNumber: true,
        lastLogin: true,
        nickName: true,
        firstName: true,
        lastName: true,
        profilePicturePath: true,
        profilePictureName: true,
        isEnable: true,
        roleId: true,
        createdAt: true,
        updatedAt: true,
      },
      
    });
    if (!result) {
      throw new HttpException('vendoruser not found', HttpStatus.NOT_FOUND);
    }
    return result;
  }



  async verifyEmail(uuid: string) {
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

  async getVendorByRoleUid(uuid: string, roleName: string) {
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
        imagePath: '/' + picturePath,
        imageName: '/' +     pictureName,
        
      },
    });
  }

  async createVendor(createVendor: CreateVendorDto) {
    try {
      const uid = firstPartUid();
      await this.prisma.vendor.create({
        data: {
          uid : uid,
          ...createVendor,
        },
      });
    } catch (error) {
      return error;
    }
  }
  async updateVendor(id: number, updateVendorDto: UpdateVendorDto) {
    try {
      await this.prisma.vendor.update({
        where: {
          id: id,
        },
        data: {
          ...updateVendorDto,
        },
      });
    } catch (error) {
      return error;
    }
  }

  async updateVendorUserProfile(userUid : string, picturePath : string, pictureName: string){
    try {
      await this.prisma.vendorUser.update({
        where: {
          uid: userUid,
        },
        data: {
          profilePictureName: '/' + pictureName,
          profilePicturePath: '/' + picturePath,
        },
      });
    } catch (error) {
      return error;
    }
  }

  async updateVendorStore(vendorId : number, picturePath : string, pictureName: string){
    try {
      await this.prisma.vendor.update({
        where: {
          id: vendorId,
        },
        data: {
          storeImageName: '/' + pictureName,
          storeImagePath: '/' + picturePath,
        },
      });
    } catch (error) {
      return error;
    }
  }


}
