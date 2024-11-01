import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';
import { getCarsAndStats } from '../utils/car.uti';
import { CreateCarPostDto, UpdateCarPostDto } from '../utils/dto/car.dto';
import { log } from 'console';

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
  async getCarBar(barCount: number) {
    // Step 1: หา maxPrice และ minPrice
    const maxPrice = await this.prisma.carPost.aggregate({
      _max: { price: true },
    });
    const minPrice = await this.prisma.carPost.aggregate({
      _min: { price: true },
    });
  
    // Step 2: ตรวจสอบว่าข้อมูลไม่เป็นค่าว่าง
    if (!maxPrice._max.price || !minPrice._min.price) {
      throw new Error("ไม่พบข้อมูลราคาที่สามารถคำนวณได้");
    }
  
    // Step 3: คำนวณ barRange
    const barRange = (maxPrice._max.price.toNumber() - minPrice._min.price.toNumber()) / barCount;
  
    // Step 4: สร้างอาเรย์สำหรับเก็บค่าในช่วงราคา
    const barArray: number[] = new Array(barCount).fill(0);
  
    // Step 5: ใส่ค่าลงในอาเรย์ตามช่วงราคา
    for (let i = 0; i < barCount; i++) {
      const lowerBound = minPrice._min.price.toNumber() + i * barRange;
      const upperBound = (i === barCount - 1) ? maxPrice._max.price.toNumber() : lowerBound + barRange;
  
      // ใช้ lte ในบาร์สุดท้าย
      const carCountInRange = await this.prisma.carPost.count({
        where: {
          price: {
            gte: lowerBound,  // ราคาตั้งแต่ lowerBound ขึ้นไป
            // ใช้ lt หรือ lte ขึ้นอยู่กับว่าเป็นบาร์สุดท้ายหรือไม่
            [i === barCount - 1 ? 'lte' : 'lt']: upperBound,  
          },
        },
      });
  
      barArray[i] = carCountInRange; // ใส่ค่าจำนวนรถที่อยู่ในช่วงนี้ลงในอาเรย์
    }
  
    return {
      barRange,
      minPrice: minPrice._min.price.toNumber(),
      maxPrice: maxPrice._max.price.toNumber(),
      bars: barArray,
    };
  }
}
