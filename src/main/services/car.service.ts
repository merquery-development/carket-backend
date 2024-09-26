import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';
import { CreateCarDto } from '../utils/car.dto';

@Injectable()
export class CarService {
  constructor(private readonly prisma: PrismaService) {}

  getAllCar() {
    const result = this.prisma.car.findMany();

    if (!result) {
      throw new HttpException('result not found', HttpStatus.BAD_REQUEST);
    }
    return result;
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
