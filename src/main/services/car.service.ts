import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
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
        id: 'asc',
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
        posts: {
          select: {
            price: true,
            mileage: true,
            pictures: {
              select: {
                id: true,
                pictureName: true,
                picturePath: true,
              },
            },
          },
        },
      },
    });
  
    // ปรับรูปแบบ output และสุ่มเลือกข้อมูล
    const randomCars = cars
      .map(car => ({
        id: car.id,
        year: car.year,
        mileage: car.mileage,
        category: car.Category.name, // เปลี่ยนเป็น string
        brand: car.Brand.name,       // เปลี่ยนเป็น string
        model: car.Model.name,
        posts: car.posts.map(post => ({
          price: post.price,
          mileage: post.mileage,
          pictures: post.pictures.map(picture => ({
            id: picture.id,
            pictureName: picture.pictureName,
            picturePath: picture.picturePath,
          })),
        })),
      }))
      .sort(() => 0.5 - Math.random()) // สุ่มลำดับ
      .slice(0, amount);               // เลือกจำนวนที่กำหนด
  
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
