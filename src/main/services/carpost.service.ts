import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';
import { getCarsAndStats } from '../utils/car.uti';
import { CreateCarPostDto, UpdateCarPostDto } from '../utils/dto/car.dto';
import { firstPartUid } from '../utils/pagination';
@Injectable()
export class CarPostService {
  constructor(private readonly prisma: PrismaService) {}
  async createCarPost(createCarPostDto: CreateCarPostDto) {
    // @comment no vendor validation
    // @comment no price validatation < 0
    // @comment no year validation < 0
    // @comment why also create view count ? default should be zero
    try {
      const uid = firstPartUid();
      // console.log(createCarPostDto[1]);
      
      const result = await this.prisma.carPost.create({
        data: {
          carId: createCarPostDto.carId,
          uid: uid,
          vendorId: createCarPostDto.vendorId,
          price: new Prisma.Decimal(createCarPostDto.price),
          year: createCarPostDto.year,
          mileage: createCarPostDto.mileage,
          overrideSpecification: createCarPostDto.overrideSpecification,
          isDiscount: createCarPostDto.isDiscount,
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
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async updateCarPost(id: string, updateCarPostDto: UpdateCarPostDto) {
    // @comment no vendor validation, to check if the vendor update there own carpost of someone else's carpost
    // @comment also no data validation
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
    // @comment no vendor validation
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
    const result = await getCarsAndStats({
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
    result.items = result.items.map((item) => ({
      id: item.id,
      basePrice: item.price,
      year: item.year,
      category: item.car?.Category?.name || null, // Extract category name
      brand: item.car?.Brand?.name || null, // Extract brand name
    }));
    return result;
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
  async getCarBar() {
    // Step 1: Retrieve max and min prices
    const maxPrice = await this.prisma.carPost.aggregate({
      _max: { price: true },
    });
    const minPrice = await this.prisma.carPost.aggregate({
      _min: { price: true },
    });

    // Step 2: Check if data is available
    if (!maxPrice._max.price || !minPrice._min.price) {
      throw new Error('ไม่พบข้อมูลราคาที่สามารถคำนวณได้');
    }

    // Define class ranges
    const classes = [
      { name: 'eco-class', min: 0, max: 1000000, range: 10000 },
      { name: 'mid-class', min: 1000000, max: 3000000, range: 50000 },
      { name: 'high-class', min: 3000000, max: 5000000, range: 50000 },
      {
        name: 'all-class',
        min: minPrice._min.price.toNumber(),
        max: maxPrice._max.price.toNumber(),
        range: 50000,
      },
    ];

    // Result to hold bars data for each class
    const result = {};

    // Step 3: Calculate bars for each class
    for (const classInfo of classes) {
      const { name, min, max, range } = classInfo;
      const barCount = Math.ceil((max - min) / range);
      const barRange = range;

      // Initialize array to store car count in each bar
      const barArray: number[] = new Array(barCount).fill(0);

      // Step 4: Populate car counts in each bar
      for (let i = 0; i < barCount; i++) {
        const lowerBound = min + i * barRange;
        const upperBound = i === barCount - 1 ? max : lowerBound + barRange;

        // Count cars within the current range
        const carCountInRange = await this.prisma.carPost.count({
          where: {
            price: {
              gte: lowerBound,
              [i === barCount - 1 ? 'lte' : 'lt']: upperBound,
            },
          },
        });

        barArray[i] = carCountInRange;
      }

      // Store class data in the result
      result[name] = {
        barCount,
        barRange,
        minPrice: min,
        maxPrice: max,
        bars: barArray,
      };
    }

    return result;
  }
  async getRecommendedCars(amount: number) {
    const carPosts = await this.prisma.carPost.findMany({
      select: {
        id: true,
        year: true,
        mileage: true,
        price: true,
        vendor: {
          select: {
            address: true,
            name: true,
          },
        },
        pictures: {
          select: {
            pictureName: true,
            picturePath: true,
          },
        },
        car: {
          select: {
            Category: {
              select: {
                name: true,
              },
            },
            Model: {
              select: {
                name: true,
              },
            },
            Brand: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    // สุ่มและเลือกจำนวนรถที่ต้องการ
    const randomCars = carPosts
      .sort(() => Math.random() - 0.5) // สุ่มลำดับทุกครั้งที่เรียกใช้
      .slice(0, amount); // เลือกจำนวนที่กำหนด

    // จัดรูปแบบ output
    return randomCars.map((post) => ({
      id: post.id,
      year: post.year,
      mileage: post.mileage,
      price: post.price,
      vendor: {
        address: post.vendor.address,
        name: post.vendor.name,
      },
      category: post.car?.Category?.name,
      model: post.car?.Model?.name,
      brand: post.car?.Brand?.name,
      pictures: post.pictures.map(
        (picture) => `${picture.picturePath}${picture.pictureName}`,
      ), // เก็บทุกรูปในรูปแบบ array ของ string path
    }));
  }
  async getCarpostByUid(Uid: string) {
    const result = this.prisma.carPost.findFirst({
      where: {
        uid: Uid,
      },
    });

    return result;
  }
}
