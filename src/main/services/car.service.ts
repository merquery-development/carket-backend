import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';
import { CreateCarDto } from '../utils/dto/car.dto';
import { getPagination } from '../utils/pagination';

@Injectable()
export class CarService {
  constructor(private readonly prisma: PrismaService) {}

  async getCars({
    page = null,
    pageSize = null,
    brandId = null,
    categoryId = null,
    priceMin = null,
    priceMax = null,
    mileageMin = null,
    mileageMax = null,
    sortBy = 'createdAt', // Default sort field
    sortOrder = 'asc', // Default sort order
  }: {
    page?: number | null;
    pageSize?: number | null;
    brandId?: number | null;
    categoryId?: number | null;
    priceMin?: number | null;
    priceMax?: number | null;
    mileageMin?: number | null;
    mileageMax?: number | null;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) {
    const { skip, take } = getPagination(page, pageSize);
  
    // Dynamic where conditions based on filters
    const where = {
      ...(brandId ? { brandId: { equals: brandId } } : {}),
      ...(categoryId ? { categoryId: { equals: categoryId } } : {}),
      ...(priceMin !== null && priceMax !== null ? { basePrice: { gte: priceMin, lte: priceMax } } : {}),
      ...(mileageMin !== null && mileageMax !== null ? { mileage: { gte: mileageMin, lte: mileageMax } } : {}),
    };
  
    const [cars, total, mileageStats, priceStats] = await Promise.all([
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
          basePrice: true,
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
      }),
  
      // Get total count of cars
      this.prisma.car.count({
        where,
      }),
  
      // Get statistics for mileage (grouped by predefined ranges)
      this.prisma.car.groupBy({
        by: ['mileage'],
        _count: true,
        where,
        orderBy: {
          mileage: 'asc',
        },
        having: {
          mileage: {
            gte: mileageMin ?? 0,
            lte: mileageMax ?? 1000000,
          },
        },
      }),
  
      // Get statistics for price (grouped by predefined ranges)
      this.prisma.car.groupBy({
        by: ['basePrice'],
        _count: true,
        where,
        orderBy: {
          basePrice: 'asc',
        },
        having: {
          basePrice: {
            gte: priceMin ?? 0,
            lte: priceMax ?? 10000000,
          },
        },
      }),
    ]);
  
    const data = {
      cars,
      total,
      page: page || 1,
      pageSize: pageSize || total, // Default to total if no pageSize is given
  
      // Send mileage and price statistics
      mileageStats: mileageStats.map(stat => ({
        mileage: stat.mileage,
        count: stat._count,
      })),
  
      priceStats: priceStats.map(stat => ({
        price: stat.basePrice,
        count: stat._count,
      })),
    };
  
    return data;
  }
  async getRecommendedCars(amount: number) {
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

  async getAllBrand() {
    try {
      const result = this.prisma.brand.findMany();
      return result;
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }
  async getAllCategory() {
    try {
      const result = this.prisma.category.findMany();
      return result;
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }

  async getCarById(id: string) {
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
  async updateBrandLogo(brandId: number, logoName: string, logoPath: string) {
    await this.prisma.brand.update({
      where: { id: brandId },
      data: {
        logoName: logoName,
        logoPath: logoPath,
      },
    });
  }

  async updateCategoryLogo(
    categoryId: number,
    logoName: string,
    logoActiveName: string,
    logoPath: string,
  ) {
    await this.prisma.category.update({
      where: { id: categoryId },
      data: {
        logoName: logoName,
        logoNameActive: logoActiveName,
        logoPath: logoPath,
      },
    });
  }
  async updateCarPicture(carId: number, pictureName: string, picturePath: string) {
    await this.prisma.carPicture.create({
      data: {
        carId,
        pictureName,
        picturePath,
        type: 'car',
      },
    });
  }

  async getAllCarPics(carId : number){
   return await this.prisma.carPicture.findMany({
      where : {carId : carId}
    })
  }

  async getCategoryLogoById(id: number){
    return await this.prisma.category.findFirst({
      where : {
        id : id
      }
    })
  }
  async getBrandLogoById(id: number){
    return await this.prisma.category.findFirst({
      where : {
        id : id
      }
    })
  }

}
