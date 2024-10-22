import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';
import { getCarsAndStats } from '../utils/car.uti';
import { CreateCarDto, UpdateCarDto } from '../utils/dto/car.dto';

@Injectable()
export class CarService {
  constructor(private readonly prisma: PrismaService) {}

  async getCars(params) {
    return await getCarsAndStats({
      prismaModel: this.prisma.car, // Use Car model
      customSelect: {
        id: true,
        basePrice: true,
        mileage: true,
        year: true,
        Category: { select: { name: true } },
        Brand: { select: { name: true } },
      },
      fieldMapping: {
        priceField: 'basePrice', // Use Car's basePrice
        mileageField: 'mileage',
        brandIdField: 'brandId',
        categoryIdField: 'categoryId',
      },
      ...params, // Pass other params dynamically
    });
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

  async updateCar(id: string, updateCarDto: UpdateCarDto) {
    try {
      const result = await this.prisma.car.update({
        where: { id: Number(id) },
        data: {
          ...updateCarDto,
        },
      });
      if (!result) {
        throw new HttpException(
          'Error while update car',
          HttpStatus.BAD_REQUEST,
        );
      }
      return { message: 'update successfull' };
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }
  async deleteSoftCar(id: string) {
    try {
      const result = this.prisma.car.update({
        where: { id: Number(id) },
        data: {
          deletedAt: new Date(),
        },
      });
      if (!result) {
        throw new HttpException(
          'Error while delete staff',
          HttpStatus.BAD_REQUEST,
        );
      }
      return { message: 'delete staff successfull' };
    } catch (error) {
      // Handle error
      throw new HttpException(error, HttpStatus.NOT_FOUND);
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
      const result = this.prisma.car.findFirst({
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
  async updateCarPicture(
    carId: number,
    pictureName: string,
    picturePath: string,
  ) {
    await this.prisma.carPicture.create({
      data: {
        carId,
        pictureName,
        picturePath,
        type: 'car',
      },
    });
  }

  async getAllCarPics(carId: number) {
    return await this.prisma.carPicture.findMany({
      where: { carId: carId },
    });
  }

  async getCategoryLogoById(id: number) {
    return await this.prisma.category.findFirst({
      where: {
        id: id,
      },
    });
  }
  async getBrandLogoById(id: number) {
    return await this.prisma.category.findFirst({
      where: {
        id: id,
      },
    });
  }
}
