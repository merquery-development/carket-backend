import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { getCarsAndStats } from '../utils/car.uti';
import { CreateCarDto, UpdateCarDto } from '../utils/dto/car.dto';

@Injectable()
export class CarService {
  constructor(private readonly prisma: PrismaService) {}

  async getCars(params) {
    return await getCarsAndStats({
      prismaModel: this.prisma.car,
      customSelect: {
        id: true,
        basePrice: true,
        year: true,
        Category: { select: { name: true } },
        Brand: { select: { name: true } },
      },
      fieldMapping: {
        priceField: 'basePrice',
        brandIdField: 'brandId',
        categoryIdField: 'categoryId',
      },
      ...params,
    });
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
          basePrice: createCarDto.basePrice, // ใช้ Prisma.Decimal เพื่อจัดการ Decimal
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
      return { message: 'delete car successfull' };
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

  async getCarById(id: number) {
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

  async getCategoryByCarId(id: number) {
    try {
      const result = await this.prisma.category.findFirst({
        where: {
          cars: {
            some: {
              id: id
            }
          }
        },
      });
      return result;
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }


  async updateBrandLogo(
    brandId: number,
    logoName: string,
    logoPath: string,
    logoLightName: string,
    logoLightPath: string,
  ) {
    await this.prisma.brand.update({
      where: { id: brandId },
      data: {
        logoName: logoName,
        logoPath: logoPath,
        logoLightBgName: logoLightName,
        logoLightBgPath: logoLightPath,
      },
    });
  }

  async updateCategoryLogo(
    categoryId: number,
    logoName: string,
    logoPath: string,
  ) {
    await this.prisma.category.update({
      where: { id: categoryId },
      data: {
        logoName: logoName,

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
        pictureName: '/' + pictureName,
        picturePath: '/' + picturePath,
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
