import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';
import { getCarsAndStats } from '../utils/car.uti';
import { CreateCarPostDto, UpdateCarPostDto } from '../utils/dto/car.dto';

@Injectable()
export class CarPostService {
  constructor(private readonly prisma: PrismaService) {}
  async createCarPost(createCarPostDto: CreateCarPostDto) {
    try {
      const result = await this.prisma.carPost.create({
        data: {
          carId: createCarPostDto.carId,
          vendorId: createCarPostDto.vendorId,
          price: new Prisma.Decimal(createCarPostDto.price),
          year: createCarPostDto.year,
          mileage: createCarPostDto.mileage,
          overrideSpecification: createCarPostDto.overrideSpecification,
          isDiscount: createCarPostDto.isDiscount,
          viewCount: createCarPostDto.viewCount,
          preDiscountPrice: new Prisma.Decimal(
            createCarPostDto.preDiscountPrice,
          ),
        },
      });

      if (!result) {
        throw new HttpException(
          "Can't create car post",
          HttpStatus.BAD_REQUEST,
        );
      }

      return result;
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }

  async updateCarPost(id: string, updateCarPostDto: UpdateCarPostDto) {
    try {
      const result = await this.prisma.carPost.update({
        where: { id: Number(id) },
        data: {
          ...updateCarPostDto,
        },
      });

      if (!result) {
        throw new HttpException(
          'Error while updating car post',
          HttpStatus.BAD_REQUEST,
        );
      }

      return { message: 'Update successful' };
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }

  async deleteSoftCarPost(id: string) {
    try {
      const result = await this.prisma.carPost.update({
        where: { id: Number(id) },
        data: {
          deletedAt: new Date(),
        },
      });

      if (!result) {
        throw new HttpException(
          'Error while deleting car post',
          HttpStatus.BAD_REQUEST,
        );
      }

      return { message: 'Delete successful' };
    } catch (error) {
      throw new HttpException(error, HttpStatus.NOT_FOUND);
    }
  }

  async getCarPosts(params) {
    return await getCarsAndStats({
      prismaModel: this.prisma.carPost, // Use CarPost model
      customSelect: {
        id: true,
        price: true,
        mileage: true,
        year: true,
        car: {
          select: {
            Brand: { select: { name: true } },
            Category: { select: { name: true } },
          },
        },
        vendor: {
          select: { name: true },
        },
      },
      fieldMapping: {
        priceField: 'price', // Use CarPost's price
        mileageField: 'mileage',
        brandIdField: 'car.brandId', // Reference related Car model
        categoryIdField: 'car.categoryId', // Reference related Car model
      },
      ...params, // Pass other params dynamically
    });
  }
  async getCarPostById(id: string) {
    try {
      const result = this.prisma.carPost.findFirst({
        where: {
          id: Number(id),
        },
      });
      return result;
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }

  
}
