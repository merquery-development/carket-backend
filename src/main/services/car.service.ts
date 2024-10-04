import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';
import { CreateCarDto } from '../utils/car.dto';
import { getPagination } from '../utils/pagination';

@Injectable()
export class CarService {
  constructor(private readonly prisma: PrismaService) {}

  async getCars({
    page = null,
    pageSize = null,
    year,
    sortBy = 'createdAt', // Default sort field
    sortOrder = 'asc', // Default sort order
  }: {
    page?: number | null;
    pageSize?: number | null;
    year?: number;
    sortBy?: string; // Field to sort by
    sortOrder?: 'asc' | 'desc'; // Sort direction
  }) {
    const { skip, take } = getPagination(page, pageSize);
    const where = {
      ...(year ? { year: { equals: year } } : {}),
    };

    const [cars, total] = await Promise.all([
      this.prisma.car.findMany({
        skip,
        take,
        where,
        orderBy: {
          [sortBy]: sortOrder, // Dynamic sort field and direction
        },
        select: {
          id: true,
          year: true,
          mileage: true,
          Category :{
            select: {
              name: true,
            },
          },
          Brand : {
            select: {
              name: true,
            },
          },
          Model : {
            select: {
              name: true,
            },
          }

        },
      }),
      this.prisma.car.count({
        where,
      }),
    ]);

    try {
      const data = {
        cars,
        total,
        page: page || 1,
        pageSize: pageSize || total, // Set pageSize to total if null, showing all records
      };

      return data;
    } catch (error) {
      throw new HttpException(error, HttpStatus.NOT_FOUND);
    }
  }
  async getRecommendedCars(amount : number) {
    const cars = await this.prisma.car.findMany({
      orderBy: {
        id: 'asc', // เพื่อให้การค้นหาไม่ชนกันกับ random
      },
      select: {
        id: true,
        year: true,
        mileage: true,
        Category: {
          select: {
            name: true,
          },
        },
        Brand: {
          select: {
            name: true,
          },
        },
        Model: {
          select: {
            name: true,
          },
        },
      },
    });
  
   
    const randomCars = cars.sort(() => 0.5 - Math.random()).slice(0, amount);
  
    return randomCars;
  }
  async createCar(createCarDto: CreateCarDto) {
    try {
      const result = await this.prisma.car.create({
        data: {
          categoryId: createCarDto.categoryId,
          brandId: createCarDto.brandId,
          modelId: createCarDto.modelId,
          year: createCarDto.year,
          specifications: createCarDto.specifications,
          basePrice: new Prisma.Decimal(createCarDto.basePrice), // ใช้ Prisma.Decimal เพื่อจัดการ Decimal
        },
      });
      if (!result) {
        return "Can't create cars";
      }
      return result;
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }
}
