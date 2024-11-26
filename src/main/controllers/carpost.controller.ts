import { CacheKey, CacheTTL } from '@nestjs/cache-manager';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  Req,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
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
import { CarPostService } from '../services/carpost.service';
import { FileUploadService } from '../services/file.service';
import { CarViewInterceptor } from '../utils/carviewIntercep';
import { CreateCarpostPicDto, UpdateCarPostDto } from '../utils/dto/car.dto';

@ApiTags('carposts')
@Controller('carposts')
@ApiBearerAuth('defaultBearerAuth')
// @UseGuards(CarPostGuard)
export class CarPostController {
  constructor(
    private readonly carPostService: CarPostService,
    private readonly fileService: FileUploadService,
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
  ) {
    let postData = JSON.parse(JSON.stringify(createCarpostPic));
    postData.carId = Number(postData.carId);
    postData.vendorId = Number(postData.vendorId);
    postData.price = Number(postData.price);
    postData.year = Number(postData.year);
    postData.mileage = Number(postData.mileage);
    postData.isDiscount = Boolean(postData.isDiscount);

    try {
      // Step 1: Create car post
      const carPost = await this.carPostService.createCarPost(postData);

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
  ) {
    try {
      const updatedCarPost = await this.carPostService.updateCarPost(
        carPostId,
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
  @ApiQuery({ name: 'brandId', required: false, type: String })
  @ApiQuery({ name: 'categoryId', required: false, type: String })
  @ApiQuery({ name: 'priceMin', required: false, type: String })
  @ApiQuery({ name: 'priceMax', required: false, type: String })
  @ApiQuery({ name: 'mileageMin', required: false, type: String })
  @ApiQuery({ name: 'mileageMax', required: false, type: String })
  @ApiQuery({ name: 'sortBy', required: false, type: String })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'] })
  async getCarPosts(
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('brandId') brandId?: string,
    @Query('categoryId') categoryId?: string,
    @Query('priceMin') priceMin?: string,
    @Query('priceMax') priceMax?: string,
    @Query('mileageMin') mileageMin?: string,
    @Query('mileageMax') mileageMax?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'asc' | 'desc',
  ) {
    try {
      const result = await this.carPostService.getCarPosts({
        page: page ? parseInt(page, 10) : null, // แปลงเป็น number
        pageSize: pageSize ? parseInt(pageSize, 10) : null, // แปลงเป็น number
        brandId: brandId ? parseInt(brandId, 10) : null, // แปลงเป็น number
        categoryId: categoryId ? parseInt(categoryId, 10) : null, // แปลงเป็น number
        priceMin: priceMin ? parseFloat(priceMin) : null, // แปลงเป็น float (กรณีใช้ทศนิยม)
        priceMax: priceMax ? parseFloat(priceMax) : null, // แปลงเป็น float (กรณีใช้ทศนิยม)
        mileageMin: mileageMin ? parseInt(mileageMin, 10) : null, // แปลงเป็น number
        mileageMax: mileageMax ? parseInt(mileageMax, 10) : null, // แปลงเป็น number
        sortBy,
        sortOrder,
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
      console.log(role);

      // const deletedCar = await this.carPostService.deleteSoftCarPost(carId);
      // return { message: 'Car deleted successfully', deletedCar };
    } catch (error) {
      throw new HttpException(
        { message: 'Error deleting car', error: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  @CacheKey('custom_key')
  @CacheTTL(24 * 60 * 60 * 1000) //millisecond
  @Get('bar')
  @ApiResponse({
    status: 200,
    description: 'Returns an array of car counts per price range',
  })
  async getBar() {
    return await this.carPostService.getCarBar();
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
