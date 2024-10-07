import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { Vendor } from '../guards/vendor.guard';
import { CarService } from '../services/car.service';
import { CreateCarDto } from '../utils/dto/car.dto';
@ApiTags('cars')
@Controller('cars')
@ApiBearerAuth('defaultBearerAuth')
// @UseGuards(Vendor)
// @UseGuards(Vendor)
export class CarController {
  constructor(private readonly carService: CarService) {}

  @Post('')
  @ApiOperation({ summary: 'Create car' })
  @ApiCreatedResponse({
    description: 'The record has been successfully created.',
    type: CreateCarDto,
  })
  createCar(@Body() postData: CreateCarDto) {
    return this.carService.createCar(postData);
  }
  @Get('')
  @ApiOperation({ summary: 'Get All Data of Car require login' })
  @ApiOkResponse({
    description: 'All Car list',
  })
  @ApiNotFoundResponse({
    description: 'result not found',
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal Server Error',
  })
  @ApiQuery({
    name: 'year',
    required: false,
    type: String,
    description: 'Filter by username',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: String,
    description: 'Page number for pagination (nullable)',
  })
  @ApiQuery({
    name: 'pageSize',
    required: false,
    type: String,
    description: 'Number of items per page for pagination (nullable)',
  })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    type: String,
    description: 'Field to sort by (e.g., createdAt)',
  })
  @ApiQuery({
    name: 'sortOrder',
    required: false,
    type: String,
    enum: ['asc', 'desc'],
    description: 'Sort direction (asc or desc)',
  })
  async getCars(
    @Query('page') page: number,
    @Query('pageSize') pageSize: number,
    @Query('year') year: number,
    @Query('sortBy') sortBy: string,
    @Query('sortOrder') sortOrder: 'asc' | 'desc',
  ) {
    try {
      // เรียกใช้ service ที่เราเขียนไว้
      const result = await this.carService.getCars({
        page: page || null,
        pageSize: pageSize || null,
        year: year || null,
        sortBy: sortBy || 'createdAt',
        sortOrder: sortOrder || 'asc',
      });
      return result;
    } catch (error) {
      throw new HttpException(
        { message: 'Error fetching car data', error: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR,
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
      const recommendedCars = await this.carService.getRecommendedCars(amount);
      return recommendedCars;
    } catch (error) {
      throw new HttpException(
        { message: 'Error fetching recommended cars', error: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
