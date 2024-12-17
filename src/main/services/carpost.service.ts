import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';

import { CreateCarPostDto, UpdateCarPostDto } from '../utils/dto/car.dto';
import { firstPartUid } from '../utils/pagination';

@Injectable()
export class CarPostService {
  constructor(private readonly prisma: PrismaService) {}
  async createCarPost(vId: number, createCarPostDto: CreateCarPostDto) {
    try {
      const uid = firstPartUid();

      const result = await this.prisma.carPost.create({
        data: {
          carId: createCarPostDto.carId,
          uid: uid,
          vendorId: vId,
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

  async updateCarPost(
    id: string,
    vendorId: number,
    updateCarPostDto: UpdateCarPostDto,
  ) {
    try {
      const result = await this.prisma.carPost.updateMany({
        where: {
          id: Number(id),
          vendorId: vendorId,
        },
        data: {
          ...updateCarPostDto,
        },
      });

      if (result.count === 0) {
        throw new HttpException(
          'Error while updating car post or no matching record found',
          HttpStatus.BAD_REQUEST,
        );
      }

      return { message: 'Update successful' };
    } catch (error) {
      throw new HttpException(
        error.message || 'Unexpected error occurred',
        HttpStatus.BAD_REQUEST,
      );
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
    const {
      page,
      pageSize,
      brandId,
      categoryId,
      priceMin,
      priceMax,
      mileageMin,
      mileageMax,
      sortBy,
      sortOrder,
      search,
    } = params;

    const pageNumber = page ? parseInt(page, 10) : 1;
    const pageLimit = pageSize ? parseInt(pageSize, 10) : 10;

    // สร้างเงื่อนไขการค้นหา
    const where = {};
    if (brandId != null && brandId != undefined) {
      if (brandId.length > 1) {
        where['car'] = {
          brandId: { in: brandId.map((id) => parseInt(id, 10)) },
        };
      }
      if (brandId.length == 1) {
        where['car'] = { brandId: Number(brandId) };
      }
    }

    if (categoryId != null && categoryId != undefined) {
      if (categoryId.length > 1) {
        where['car'] = {
          Category: { id: { in: categoryId.map((id) => parseInt(id, 10)) } },
        };
      }
      if (categoryId.length == 1) {
        where['car'] = { Category: { id: Number(categoryId) } };
      }
    }
    if (priceMin) {
      where['price'] = { gte: priceMin };
    }
    if (priceMax) {
      where['price'] = { lte: priceMax };
    }
    if (mileageMin) {
      where['mileage'] = { gte: mileageMin };
    }
    if (mileageMax) {
      where['mileage'] = { lte: mileageMax };
    }

    if (search) {
      where['OR'] = [
        {
          car: {
            Model: { name: { contains: search, mode: 'insensitive' } }, // ค้นหาใน modelName ของ car
          },
        },
        {
          vendor: {
            name: { contains: search, mode: 'insensitive' }, // ค้นหาใน name ของ vendor
          },
        },
      ];
    }

    // ตั้งค่า sort order
    const orderBy = sortBy
      ? { [sortBy]: sortOrder === 'desc' ? 'desc' : 'asc' }
      : undefined;

    // ดึงข้อมูลจาก Prisma
    const result = await this.prisma.carPost.findMany({
      where,
      skip: (pageNumber - 1) * pageLimit,
      take: pageLimit,
      orderBy,
      select: {
        id: true,
        price: true,
        mileage: true,
        year: true,
        favoriteCount: true,

        car: {
          select: {
            Brand: { select: { name: true } },
            Category: { select: { name: true } },
            Model: { select: { name: true } },
          },
        },
        vendor: {
          select: {
            name: true,
            address: true,
            users: {
              select: {
                username: true,
                profilePicturePath: true,
                profilePictureName: true,
              },
            },
          },
        },
        pictures: {
          select: {
            pictureName: true,
            picturePath: true,
          },
        },
      },
    });

    // จัดการข้อมูลผลลัพธ์
    const items = result.map((item) => ({
      id: item.id,
      price: parseFloat(Number(item.price).toFixed(2)),
      year: item.year,
      mileage: item.mileage,
      favorite: item.favoriteCount,
      vendor: {
        name: item.vendor.name,
        address: item.vendor.address,
        profile:
          item.vendor.users.length > 0
            ? `${item.vendor.users[0].profilePicturePath}${item.vendor.users[0].profilePictureName}`
            : null,
      },
      category: item.car?.Category?.name || null,
      brand: item.car?.Brand?.name || null,
      model: item.car?.Model?.name || null,
      pictures: item.pictures.map(
        (picture) => `${picture.picturePath}${picture.pictureName}`,
      ),
    }));

    // // คำนวณจำนวนหน้าทั้งหมด
    // const totalCount = await this.prisma.carPost.count({ where });
    // const totalPages = Math.ceil(totalCount / pageLimit);

    return items;
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

  async getCarPostByVendorUid(params) {
    const {
      uid,
      page,
      pageSize,
      priceMin,
      priceMax,
      mileageMin,
      mileageMax,
      sortBy,
      sortOrder,
      search,
    } = params;

    const pageNumber = page ? parseInt(page, 10) : 1;
    const pageLimit = pageSize ? parseInt(pageSize, 10) : 10;

    const where: any = {
      vendor: {
        users: {
          some: { uid },
        },
      },
    };

    // เงื่อนไขช่วงราคา
    if (priceMin !== undefined) {
      where['price'] = { ...where['price'], gte: priceMin };
    }
    if (priceMax !== undefined) {
      where['price'] = { ...where['price'], lte: priceMax };
    }

    // เงื่อนไขช่วง Mileage
    if (mileageMin !== undefined) {
      where['mileage'] = { ...where['mileage'], gte: mileageMin };
    }
    if (mileageMax !== undefined) {
      where['mileage'] = { ...where['mileage'], lte: mileageMax };
    }

    // เงื่อนไขการค้นหา
    if (search) {
      where['OR'] = [
        {
          car: {
            Model: { name: { contains: search, mode: 'insensitive' } },
          },
        },
        {
          vendor: {
            name: { contains: search, mode: 'insensitive' },
          },
        },
      ];
    }

    // ตั้งค่า sort order
    const orderBy = sortBy
      ? { [sortBy]: sortOrder === 'desc' ? 'desc' : 'asc' }
      : undefined;

    try {
      // ดึงข้อมูลจาก Prisma
      const result = await this.prisma.carPost.findMany({
        where,
        skip: (pageNumber - 1) * pageLimit,
        take: pageLimit,
        orderBy,
        select: {
          id: true,
          price: true,
          mileage: true,
          year: true,
          favoriteCount: true,
          car: {
            select: {
              Brand: { select: { name: true } },
              Category: { select: { name: true } },
              Model: { select: { name: true } },
            },
          },
          vendor: {
            select: {
              name: true,
              address: true,
              users: {
                select: {
                  username: true,
                  profilePicturePath: true,
                  profilePictureName: true,
                },
              },
            },
          },
          pictures: {
            select: {
              pictureName: true,
              picturePath: true,
            },
          },
        },
      });

      // จัดการข้อมูลผลลัพธ์ให้อยู่ในรูปแบบที่กำหนด
      const items = result.map((item) => ({
        id: item.id,
        price: parseFloat(Number(item.price).toFixed(2)),
        year: item.year,
        mileage: item.mileage,
        favorite: item.favoriteCount,
        vendor: {
          name: item.vendor.name,
          address: item.vendor.address,
          profile:
            item.vendor.users.length > 0
              ? `${item.vendor.users[0].profilePicturePath}${item.vendor.users[0].profilePictureName}`
              : null,
        },
        category: item.car?.Category?.name || null,
        brand: item.car?.Brand?.name || null,
        model: item.car?.Model?.name || null,
        pictures: item.pictures.map(
          (picture) => `${picture.picturePath}${picture.pictureName}`,
        ),
      }));

      return items;
    } catch (error) {
      throw new HttpException(
        error.message || 'Error retrieving car posts by vendor UID',
        HttpStatus.BAD_REQUEST,
      );
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
      { name: 'ecoClass', min: 1, max: 1000000, range: 10000 },
      { name: 'midClass', min: 1000001, max: 3000000, range: 50000 },
      { name: 'highClass', min: 3000001, max: 5000000, range: 50000 },
      {
        name: 'allClass',
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
      const barCount = Math.ceil((max - min + 1) / range);
      const barRange = range;

      // Initialize array to store car count in each bar
      const barArray: number[] = new Array(barCount).fill(0);

      // Step 4: Populate car counts in each bar
      for (let i = 0; i < barCount; i++) {
        const lowerBound = min + i * barRange;
        const upperBound = i === barCount - 1 ? max : lowerBound + barRange - 1;

        // Count cars within the current range
        const carCountInRange = await this.prisma.carPost.count({
          where: {
            price: {
              gte: lowerBound,
              lte: upperBound,
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
  async getCarBarByMileage() {
    // Step 1: Retrieve max and min mileage
    const maxMileage = await this.prisma.carPost.aggregate({
      _max: { mileage: true },
    });
    const minMileage = await this.prisma.carPost.aggregate({
      _min: { mileage: true },
    });

    // Step 2: Check if data is available
    if (!maxMileage._max.mileage || !minMileage._min.mileage) {
      throw new Error('ไม่พบข้อมูลระยะไมล์ที่สามารถคำนวณได้');
    }

    // Convert BigInt to number if necessary
    const maxMileageValue =
      typeof maxMileage._max.mileage === 'bigint'
        ? Number(maxMileage._max.mileage)
        : maxMileage._max.mileage;

    const minMileageValue =
      typeof minMileage._min.mileage === 'bigint'
        ? Number(minMileage._min.mileage)
        : minMileage._min.mileage;

    // Calculate barCount for all-class
    const allClassRange = maxMileageValue - minMileageValue;
    const barCount = allClassRange > 0 ? Math.ceil(allClassRange / 5000) : 1;

    // Define mileage ranges for each class
    const classes = [
      { name: 'lowMileage', min: 1, max: 50000, range: 5000 },
      { name: 'midMileage', min: 50001, max: 150000, range: 10000 },
      { name: 'highMileage', min: 150001, max: 300000, range: 10000 },
      {
        name: 'allMileage',
        min: 1, // แก้ให้เริ่มที่ 1
        max: maxMileageValue,
        range: 5000,
        barCount,
      },
    ];

    // Result to hold bars data for each class
    const result = {};

    // Step 3: Calculate bars for each class
    for (const classInfo of classes) {
      const { name, min, max, range } = classInfo;
      const barCount = Math.ceil((max - min + 1) / range); // +1 เพื่อรวมค่า max
      const barRange = range;

      // Initialize array to store car count in each bar
      const barArray: number[] = new Array(barCount).fill(0);

      // Step 4: Populate car counts in each bar
      for (let i = 0; i < barCount; i++) {
        const lowerBound = min + i * barRange;
        const upperBound = i === barCount - 1 ? max : lowerBound + barRange - 1; // -1 เพื่อป้องกันการซ้อนกัน

        // Count cars within the current range
        const carCountInRange = await this.prisma.carPost.count({
          where: {
            mileage: {
              gte: lowerBound,
              lte: upperBound, // ใช้ lte เพื่อให้รวมค่า upperBound
            },
          },
        });

        barArray[i] = carCountInRange;
      }

      // Store class data in the result
      result[name] = {
        barCount,
        barRange,
        minMileage: min,
        maxMileage: max,
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
      price: Number(post.price),
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

  async getNewCarpostByVendor(uid: string,amount: number) {
    const limit = amount > 0 ? amount : 3;

    
    const result = await this.prisma.carPost.findMany({
      where: {
        vendor: {
          users: {
            some: { uid },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: Number(limit), // ใช้ค่าที่กำหนดจากพารามิเตอร์ amount
      select: {
        id: true,
        price: true,
        mileage: true,
        year: true,
        favoriteCount: true,
        createdAt: true,
        car: {
          select: {
            Brand: { select: { name: true } },
            Category: { select: { name: true } },
            Model: { select: { name: true } },
          },
        },
        vendor: {
          select: {
            name: true,
            address: true,
            users: {
              select: {
                username: true,
                profilePicturePath: true,
                profilePictureName: true,
              },
            },
          },
        },
        pictures: {
          select: {
            pictureName: true,
            picturePath: true,
          },
        },
      },
    });


    // จัดการข้อมูลผลลัพธ์ให้อยู่ในรูปแบบที่กำหนด
      const items = result.map((item) => {
      const date = new Date(item.createdAt);
      const month = date.toLocaleString('en-US', { month: 'short' });
      const day = date.getDate();
      const year = date.getFullYear();
  
      const formattedDate = `${month} ${day < 10 ? '0' + day : day} ${year}`;
  
      return {
        id: item.id,
        price: parseFloat(Number(item.price).toFixed(2)),
        year: item.year,
        mileage: item.mileage,
        favorite: item.favoriteCount,
        date: formattedDate, // เปลี่ยนแปลงตรงนี้
        vendor: {
          name: item.vendor.name,
          address: item.vendor.address,
          profile:
            item.vendor.users.length > 0
              ? `${item.vendor.users[0].profilePicturePath}${item.vendor.users[0].profilePictureName}`
              : null,
        },
        category: item.car?.Category?.name || null,
        brand: item.car?.Brand?.name || null,
        model: item.car?.Model?.name || null,
        pictures: item.pictures.map(
          (picture) => `${picture.picturePath}${picture.pictureName}`,
        ),
      };
    });
  
    
    return items;
  }
  async getCarPostWithOverrides(carPostUid: string) {
    // ดึงข้อมูล CarPost พร้อมข้อมูล Car ที่เกี่ยวข้อง
    const carPost = await this.prisma.carPost.findUnique({
      where: { uid: carPostUid },
      include: {
        car: true, // ดึงข้อมูลรถที่เชื่อมโยง
      },
    });
  
    if (!carPost) throw new Error('CarPost not found');
  
    // Default (Car) และ Override (CarPost.overrideSpecification)
    const carSpecifications =
      typeof carPost.car.specifications === 'object' && carPost.car.specifications !== null
        ? carPost.car.specifications
        : {}; // ตรวจสอบ Car Specifications
  
    const overrideSpecifications =
      typeof carPost.overrideSpecification === 'string'
        ? JSON.parse(carPost.overrideSpecification) // แปลง JSON String เป็น Object
        : typeof carPost.overrideSpecification === 'object' && carPost.overrideSpecification !== null
        ? carPost.overrideSpecification
        : {}; // กรณีเป็น JsonObject หรือ JsonArray
  
    // ทำการ merge ข้อมูล
    const finalSpecifications = { ...carSpecifications, ...overrideSpecifications };
  
    // คืนค่าเฉพาะ CarPost พร้อม finalSpecifications
    return {

      uid: carPost.uid,
      carId: carPost.carId,
      vendorId: carPost.vendorId,
      price: carPost.price,
      year: carPost.year,
      mileage: carPost.mileage,
      preDiscountPrice: carPost.preDiscountPrice,
      isDiscount: carPost.isDiscount,
      createdAt: carPost.createdAt,
      updatedAt: carPost.updatedAt,
      deletedAt: carPost.deletedAt,
      viewCount: carPost.viewCount,
      favoriteCount: carPost.favoriteCount,
      finalSpecifications, // ข้อมูลที่ถูก merge แล้ว
    };
  }}  