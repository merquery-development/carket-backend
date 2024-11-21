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
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { CacheKey, CacheTTL } from '@nestjs/cache-manager';
import { CustomerOrGuestGuard } from '../guards/customer.guard';
import { EmailVerifiedGuard } from '../guards/verified.guard';
import { CarPostService } from '../services/carpost.service';
import { CarViewInterceptor } from '../utils/carviewIntercep';
import { CreateCarPostDto, UpdateCarPostDto } from '../utils/dto/car.dto';

@ApiTags('carposts')
@Controller('carposts')
@ApiBearerAuth('defaultBearerAuth')
// @UseGuards(CarPostGuard)
export class CarPostController {
  constructor(private readonly carPostService: CarPostService) {}

  @UseGuards(EmailVerifiedGuard)
  @Post('')
  @ApiOperation({ summary: 'Create car post' })
  @ApiCreatedResponse({
    description: 'The car post has been successfully created.',
    type: CreateCarPostDto,
  })
  createCarPost(@Body() postData: CreateCarPostDto) {
    return this.carPostService.createCarPost(postData);
  }

  //change to carpost
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
  @UseInterceptors(CarViewInterceptor) // เพิ่ม Interceptor ที่นี่
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
  @UseGuards(CustomerOrGuestGuard)
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
  @ApiOperation({ summary: 'Soft delete car by ID' })
  async deleteSoftCar(@Param('carId') carId: string) {
    try {
      const deletedCar = await this.carPostService.deleteSoftCarPost(carId);
      return { message: 'Car deleted successfully', deletedCar };
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
