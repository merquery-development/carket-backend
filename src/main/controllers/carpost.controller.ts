import { CacheKey, CacheTTL } from '@nestjs/cache-manager';
import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  forwardRef,
  Get,
  HttpException,
  HttpStatus,
  Inject,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
  Req,
  UnauthorizedException,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CustomerOrGuestGuard } from '../guards/customer.guard';
import { AuthService } from '../services/auth.service';
import { CarPostService } from '../services/carpost.service';
import { FileUploadService } from '../services/file.service';
import { VendorService } from '../services/vendor.service';
import { CarViewInterceptor } from '../utils/carviewIntercep';
import { CreateCarpostPicDto, UpdateCarPostDto } from '../utils/dto/car.dto';

@ApiTags('carposts')
@Controller('carposts')
@ApiBearerAuth('defaultBearerAuth')
export class CarPostController {
  constructor(
    private readonly carPostService: CarPostService,
    @Inject(forwardRef(() => FileUploadService))
    private readonly fileService: FileUploadService,
    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService,
    @Inject(forwardRef(() => VendorService))
    private readonly vendorService: VendorService,
  ) {}

  // @UseGuards(EmailVerifiedGuard) // Requires email verification
  @Post('create-with-pictures')
  @ApiOperation({ summary: 'Create a car post and optionally upload pictures' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({
    status: 201,
    description: 'Car post created successfully.',
  })
  @ApiResponse({
    status: 400,
    description: 'Error creating car post or uploading pictures.',
    content: {
      'application/json': {
        example: {
          statusCode: 400,
          message: 'File size exceeds limit.',
          error: 'Bad Request',
        },
      },
    },
  })
  @ApiBody({
    description: 'Upload multiple car pictures',
    schema: {
      type: 'object',
      properties: {
        carId: { type: 'integer', example: 1 }, // Include carId field in form-data
        vendorId: { type: 'integer', example: 4 },
        price: { type: 'integer', example: 25000.99 },
        year: { type: 'integer', example: 2022 },
        mileage: { type: 'integer', example: 15000 },
        isDiscount: { type: 'boolean', example: true },
        preDiscountPrice: { type: 'integer', example: 27000.0 },
        overrideSpecification: {
          type: 'string',
          example: '{"color": "red", "engine": "v6"}',
        },
        filename: {
          type: 'array',
          items: { type: 'string', format: 'binary' },
        },
      },
    },
  })
  @UseInterceptors(AnyFilesInterceptor())
  async createCarPostWithPictures(
    @Body() createCarpostPic: CreateCarpostPicDto,
    @UploadedFiles() files: Array<Express.Multer.File>,
    @Req() request: Request,
  ) {
    let postData = JSON.parse(JSON.stringify(createCarpostPic));
    postData.carId = Number(postData.carId);
    postData.vendorId = Number(postData.vendorId);
    postData.price = Number(postData.price);
    postData.year = Number(postData.year);
    postData.mileage = Number(postData.mileage);
    postData.isDiscount = Boolean(postData.isDiscount);
    // ตรวจสอบว่า header `authorization` มีอยู่หรือไม่
    const token = request.headers['authorization']?.split(' ')[1];
    if (!token) {
      throw new BadRequestException('Authorization token is missing');
    }

    // ดึงข้อมูลโปรไฟล์จาก token
    const profile = await this.authService.getProfile(token);
    if (!profile || !profile.vendorUid) {
      throw new UnauthorizedException(
        'Invalid or expired token require vendor login',
      );
    }

    // ดึงข้อมูล vendor จาก vendorUid
    const vendorUser = await this.vendorService.getVendorUserByuid(
      profile.vendorUid,
    );
    if (!vendorUser) {
      throw new NotFoundException('Vendor not found');
    }

    try {
      //สร้างได้เฉพาะ vendor ตัวเอง
      const carPost = await this.carPostService.createCarPost(
        vendorUser.vendorId,
        postData,
      );

      if (!carPost) {
        throw new HttpException(
          "Can't create car post",
          HttpStatus.BAD_REQUEST,
        );
      }

      // Step 2: Upload pictures if they exist
      const carPictures = [];
      if (files && files.length > 0) {
        carPictures.push(
          ...(await this.fileService.uploadCarPictures(files, carPost.id)),
        );
      }

      return {
        message: 'Car post created successfully',
        carPost,
        pictures: carPictures,
      };
    } catch (error) {
      throw new HttpException(
        `Error creating car post or uploading pictures: ${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get('recommended')
  @ApiOperation({ summary: 'Get recommended cars' }) // แสดงรายละเอียดของ API
  @ApiQuery({
    name: 'amount',
    required: true,
    type: Number,
    description: 'Number of cars to recommend',
  })
  async getRecommendedCars(
    @Query('amount') amount: number, // รับจำนวนที่ต้องการแนะนำจาก query
  ) {
    if (!amount || amount <= 0) {
      throw new HttpException(
        'Amount must be greater than 0',
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      const recommendedCars =
        await this.carPostService.getRecommendedCars(amount);
      return recommendedCars;
    } catch (error) {
      throw new HttpException(
        { message: 'Error fetching recommended cars', error: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  @Put(':carPostId')
  @ApiOperation({ summary: 'Update car post by ID' })
  async updateCarPost(
    @Param('carPostId') carPostId: string,
    @Body() updateCarPostDto: UpdateCarPostDto,
    @Req() request: Request,

  ) {
    const token = request.headers['authorization']?.split(' ')[1];
    if (!token) {
      throw new BadRequestException('Authorization token is missing');
    }

    // ดึงข้อมูลโปรไฟล์จาก token
    const profile = await this.authService.getProfile(token);
    if (!profile || !profile.vendorUid) {
      throw new UnauthorizedException(
        'Invalid or expired token require vendor login',
      );
    }

    // ดึงข้อมูล vendor จาก vendorUid
    const vendorUser = await this.vendorService.getVendorUserByuid(
      profile.vendorUid,
    );
    if (!vendorUser) {
      throw new NotFoundException('Vendor not found');
    }

    try {
      const updatedCarPost = await this.carPostService.updateCarPost(
        
        carPostId,
        vendorUser.vendorId,
        updateCarPostDto,
      );
      return updatedCarPost;
    } catch (error) {
      throw new HttpException(
        { message: 'Error updating car post', error: error.message },
        HttpStatus.BAD_REQUEST,
      );
    }
  }
  @UseInterceptors(CarViewInterceptor)
  @Get('carpost/:carPostId')
  @ApiOperation({ summary: 'Get specific car post by ID' })
  @ApiOkResponse({
    description: 'Specific car post data',
  })
  async getCarPostById(@Param('carPostId') carPostId: string) {
    try {
      const carPost = await this.carPostService.getCarPostById(carPostId);
      if (!carPost) {
        throw new HttpException('Car post not found', HttpStatus.NOT_FOUND);
      }
      return carPost;
    } catch (error) {
      throw new HttpException(
        { message: 'Error fetching car post', error: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  @Get('')
  @ApiOperation({ summary: 'Get all car posts' })
  @ApiOkResponse({ description: 'List of car posts' })
  @ApiInternalServerErrorResponse({ description: 'Internal Server Error' })
  @ApiQuery({ name: 'page', required: false, type: String })
  @ApiQuery({ name: 'pageSize', required: false, type: String })
  @ApiQuery({ name: 'brandId', required: false, type: [String], isArray: true }) // รองรับ array
  @ApiQuery({ name: 'categoryId', required: false, type: [String], isArray: true }) // รองรับ array
  @ApiQuery({ name: 'priceMin', required: false, type: String })
  @ApiQuery({ name: 'priceMax', required: false, type: String })
  @ApiQuery({ name: 'mileageMin', required: false, type: String })
  @ApiQuery({ name: 'mileageMax', required: false, type: String })
  @ApiQuery({ name: 'sortBy', required: false, type: String })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'] })
  @ApiQuery({ name: 'modelName', required: false, type: String }) // เพิ่ม modelName
  @ApiQuery({ name: 'vendorName', required: false, type: String }) // เพิ่ม vendorName
  async getCarPosts(
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('brandId') brandId?: string[], // เปลี่ยนเป็น array
    @Query('categoryId') categoryId?: string[], // เปลี่ยนเป็น array
    @Query('priceMin') priceMin?: string,
    @Query('priceMax') priceMax?: string,
    @Query('mileageMin') mileageMin?: string,
    @Query('mileageMax') mileageMax?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'asc' | 'desc',
    @Query('modelName') modelName?: string, // เพิ่ม modelName
    @Query('vendorName') vendorName?: string, 
  ) {
    try {
      const result = await this.carPostService.getCarPosts({
        page: page ? parseInt(page, 10) : null,
        pageSize: pageSize ? parseInt(pageSize, 10) : null,
        brandId: brandId ? brandId.map(id => parseInt(id, 10)) : null, // แปลงเป็น array ของตัวเลข
        categoryId: categoryId ? categoryId.map(id => parseInt(id, 10)) : null, // แปลงเป็น array ของตัวเลข
        priceMin: priceMin ? parseFloat(priceMin) : null,
        priceMax: priceMax ? parseFloat(priceMax) : null,
        mileageMin: mileageMin ? parseInt(mileageMin, 10) : null,
        mileageMax: mileageMax ? parseInt(mileageMax, 10) : null,
        sortBy,
        sortOrder,
        modelName: modelName || null, // ส่ง modelName ไป
        vendorName: vendorName || null, // ส่ง vendorName ไป
      });
      return result;
    } catch (error) {
      throw new HttpException(
        { message: 'Error fetching car posts', error: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete('delete/:carId')
  @UseGuards(CustomerOrGuestGuard) // identify user is customer,vendor or guest
  @ApiOperation({ summary: 'Soft delete car by ID' })
  async deleteSoftCar(@Req() request, @Param('carId') carId: string) {
    try {
      const role = request['role'];

      const deletedCar = await this.carPostService.deleteSoftCarPost(carId);
      return { message: 'Car deleted successfully', deletedCar };
    } catch (error) {
      throw new HttpException(
        { message: 'Error deleting car', error: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  @CacheKey('bar')
  @CacheTTL(24 * 60 * 60 * 1000) //millisecond
  @Get('bar')
  @ApiResponse({
    status: 200,
    description: 'Returns an array of car counts per price range',
  })
  async getBar() {
    return await this.carPostService.getCarBar();
  }
  
  @CacheKey('bar-mile')
  @CacheTTL(24 * 60 * 60 * 1000) //millisecond
  @Get('bar-mileage')
  @ApiResponse({
    status: 200,
    description: 'Returns an array of car counts per mile range',
  })
  async getBarByMile() {
    return await this.carPostService.getCarBarByMileage();
  }


  @Get('carpost/:postUid')
  async getCarPostByUid(@Param('postUid') postUid: string) {
    try {
      const car = await this.carPostService.getCarPostById(postUid);
      return car;
    } catch (error) {
      throw new HttpException(
        { message: 'Error deleting car', error: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
