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
import { CreateCustomerDto } from '../utils/dto/customer.dto';
import { CreateReviewDto } from '../utils/dto/review.dto';
import { firstPartUid } from '../utils/pagination';
import { AuthService } from './auth.service';
@Injectable()
export class CustomerService {
  constructor(
    private readonly prisma: PrismaService, 
    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService,
    
  ) {}
  async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return await bcrypt.hash(password, saltRounds);
  }

  async getCustomer() {
    const result = this.prisma.customer.findMany({
      where: {
        deletedAt: null,
      },
    });
    return result;
  }
  async createCustomer(createCustomerDto: CreateCustomerDto) {
    try {
      if(!createCustomerDto){
        throw new BadRequestException("Not enough data to register")
      }
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
    } catch (error) {
      throw new HttpException(
        'Error while creating customer ',
        HttpStatus.BAD_REQUEST,
      );
    }
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
  async getCustomerByUid(uid: string) {
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

  // สร้างรีวิวใหม่
  async createReview(createReviewDto: CreateReviewDto) {
    const { customerId, carId, rating, comment } = createReviewDto;

    // ตรวจสอบความถูกต้องของ rating
    if (rating < 1 || rating > 5) {
      throw new HttpException(
        'Rating must be between 1 and 5',
        HttpStatus.BAD_REQUEST,
      );
    }

    return await this.prisma.review.create({
      data: {
        customerId,
        carId, // เพิ่ม carId เพื่อเชื่อมโยงกับรถ
        rating,
        comment,
      },
    });
  }

  // ดึงข้อมูลรีวิวทั้งหมดของลูกค้า
  async getReviewsByCustomer(customerId: number) {
    return await this.prisma.review.findMany({
      where: { customerId },
      orderBy: { createdAt: 'desc' },
    });
  }

  // คำนวณคะแนนเฉลี่ยของลูกค้า
  async getAverageRating(customerId: number) {
    const reviews = await this.prisma.review.findMany({
      where: { customerId },
    });

    if (reviews.length === 0) return 0;

    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    return totalRating / reviews.length;
  }

  async getCustomerFavorites(customerUid: string) {
    try {
      const favorites = await this.prisma.customerFavorite.findMany({
        where: {
          customerUid: customerUid,
        },
        include: {
          post: true, // Includes car details in the result
        },
      });
      return favorites.map((fav) => fav.post);
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }

  async addFavoriteCar(token: string, carpostId: number) {
    if (!token) {
      throw new HttpException('Token is required', HttpStatus.UNAUTHORIZED);
    }
    const customer = await this.authService.getProfile(token);
    if (!customer) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }
    try {
      await this.prisma.customerFavorite.create({
        data: {
          customerUid: customer.customeruid,
          postId: Number(carpostId),
        },
      });
      return { message: 'Car successfully added to favorites' };
    } catch (error) {

      
      throw new HttpException('Failed to add car to favorites', HttpStatus.BAD_REQUEST);
    }
  }


  async getLikedCar(token: string){
    if (!token) {
      throw new HttpException('Token is required', HttpStatus.UNAUTHORIZED);
    }
  
    const customer = await this.authService.getProfile(token);
    if (!customer) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }
    try {
      const result =  await this.prisma.customerFavorite.findMany({
        where : {
          customerUid : customer.customeruid
        },
      });
      return result;
    } catch (error) {
      throw new HttpException('Failed to retrieve liked car', HttpStatus.BAD_REQUEST);
    }
  }
  
  }

