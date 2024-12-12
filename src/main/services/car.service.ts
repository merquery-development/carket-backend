import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';

import { CreateCarDto, UpdateCarDto } from '../utils/dto/car.dto';

@Injectable()
export class CarService {
  constructor(private readonly prisma: PrismaService) {}

  async getCars(params) {
    const {
      page = 1,
      pageSize = 10,
      brandId,
      categoryId,
      year,
      priceMin,
      priceMax,
      sortBy = 'basePrice',
      sortOrder = 'asc',
    } = params;
  
    const pageNumber = page ? parseInt(page, 10) : 1;
    const pageLimit = pageSize ? parseInt(pageSize, 10) : 10;
  
    // สร้างเงื่อนไขการค้นหา
    const where = {};
    if (brandId ) {
      where['brandId'] = Number(brandId);
    }
    if(year){
      where['year'] = Number(year);
    }
    if (categoryId ) {
      where['categoryId'] = Number(categoryId);
    }
    if (priceMin) {
      where['basePrice'] = { gte: priceMin };
    }
    if (priceMax) {
      where['basePrice'] = { lte: priceMax };
    }
  
    // ตั้งค่า sort order
    const orderBy = { [sortBy]: sortOrder === 'desc' ? 'desc' : 'asc' };
  
    // ดึงข้อมูลจาก Prisma
    const cars = await this.prisma.car.findMany({
      where,
      skip: (pageNumber - 1) * pageLimit,
      take: pageLimit,
      orderBy,
      select: {
        id: true,
        basePrice: true,
        year: true,
        Category: { select: { name: true } },
        Brand: { select: { name: true } },
      },
    });
  
    // จัดการข้อมูลผลลัพธ์
    const items = cars.map((item) => ({
      id: item.id,
      basePrice: parseFloat(Number(item.basePrice).toFixed(2)), // รูปแบบราคา 2 ตำแหน่ง
      year: item.year,
      category: item.Category?.name || null,
      brand: item.Brand?.name || null,
    }));
  
    // คำนวณจำนวนหน้าทั้งหมด
    // const totalCount = await this.prisma.car.count({ where });
    // const totalPages = Math.ceil(totalCount / pageLimit);
  
    return items;
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
              id: id,
            },
          },
        },
      });
      return result;
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }

  async getCategoryById(id: number) {
    try {
      const result = await this.prisma.category.findFirst({
        where: {
          id,
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
    logos: {
      logoName?: string;
      logoPath?: string;
      logoNameActive?: string;
      logoPathActive?: string;
    },
  ) {
    // ตรวจสอบว่าหมวดหมู่มีอยู่หรือไม่
    const category = await this.prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      throw new HttpException('Category not found', HttpStatus.NOT_FOUND);
    }

    // อัปเดตข้อมูลโลโก้ตามฟิลด์ที่ส่งมา
    await this.prisma.category.update({
      where: { id: categoryId },
      data: {
        ...logos, // ใช้ Object Spread สำหรับอัปเดตเฉพาะฟิลด์ที่ส่งมา
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
