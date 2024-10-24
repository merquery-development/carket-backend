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
  UseInterceptors,
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
import { CarService } from '../services/car.service';
import { CarViewInterceptor } from '../utils/carviewIntercep';
import { CreateCarDto, UpdateCarDto } from '../utils/dto/car.dto';
@ApiTags('cars')
@Controller('cars')
@ApiBearerAuth('defaultBearerAuth')
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
    type: Number,
    description: 'Filter by year of the car',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number for pagination (nullable)',
  })
  @ApiQuery({
    name: 'pageSize',
    required: false,
    type: Number,
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
  @ApiQuery({
    name: 'mileageMin',
    required: false,
    type: Number,
    description: 'Minimum mileage to filter',
  })
  @ApiQuery({
    name: 'mileageMax',
    required: false,
    type: Number,
    description: 'Maximum mileage to filter',
  })
  @ApiQuery({
    name: 'priceMin',
    required: false,
    type: Number,
    description: 'Minimum price to filter',
  })
  @ApiQuery({
    name: 'priceMax',
    required: false,
    type: Number,
    description: 'Maximum price to filter',
  })
  @ApiQuery({
    name: 'brandId',
    required: false,
    type: Number,
    description: 'Filter by brand ID',
  })
  @ApiQuery({
    name: 'categoryId',
    required: false,
    type: Number,
    description: 'Filter by category ID',
  })
  async getCars(
    @Query('page') page: number,
    @Query('pageSize') pageSize: number,
    @Query('year') year: number,
    @Query('sortBy') sortBy: string,
    @Query('sortOrder') sortOrder: 'asc' | 'desc',
    @Query('mileageMin') mileageMin: number,
    @Query('mileageMax') mileageMax: number,
    @Query('priceMin') priceMin: number,
    @Query('priceMax') priceMax: number,
    @Query('brandId') brandId: number,
    @Query('categoryId') categoryId: number,
  ) {
    try {
      // เรียกใช้ service ที่เพิ่มฟังก์ชันการกรอง
      const filterOptions = {
        page: page || 1,
        pageSize: pageSize || 10,
        year: year || null,
        sortBy: sortBy || 'createdAt',
        sortOrder: sortOrder || 'asc',
        mileageMin: mileageMin || null,
        mileageMax: mileageMax || null,
        priceMin: priceMin || null,
        priceMax: priceMax || null,
        brandId: brandId || null,
        categoryId: categoryId || null,
      };

      const result = await this.carService.getCars(filterOptions);
      return result;
    } catch (error) {
      throw new HttpException(
        { message: 'Error fetching car data', error: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
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
      const recommendedCars = await this.carService.getRecommendedCars(amount);
      return recommendedCars;
    } catch (error) {
      throw new HttpException(
        { message: 'Error fetching recommended cars', error: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  @Get('brand')
  @ApiOperation({ summary: 'Get all brand' })
  async getAllBrand() {
    try {
      const brands = await this.carService.getAllBrand();
      return brands;
    } catch (error) {
      throw new HttpException(
        { message: 'Error fetching brand', error: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  @Get('category')
  @ApiOperation({ summary: 'Get all brand' })
  async getAllCategory() {
    try {
      const categories = await this.carService.getAllCategory();
      return categories;
    } catch (error) {
      throw new HttpException(
        { message: 'Error fetching categories', error: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  @Get('car-pic/carId/:carId')
  @ApiOperation({ summary: 'Get all carpic' })
  async getAllCarPics(@Param('carId') carId: string) {
    console.log(carId);

    return this.carService.getAllCarPics(Number(carId));
  }

  @Put('update/:carId')
  @ApiOperation({ summary: 'Update car by ID' })
  async updateCar(
    @Param('carId') carId: string,
    @Body() updateCarDto: UpdateCarDto,
  ) {
    try {
      const updatedCar = await this.carService.updateCar(carId, updateCarDto);
      return { message: 'Car updated successfully', updatedCar };
    } catch (error) {
      throw new HttpException(
        { message: 'Error updating car', error: error.message },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Delete('delete/:carId')
  @ApiOperation({ summary: 'Soft delete car by ID' })
  async deleteSoftCar(@Param('carId') carId: string) {
    try {
      const deletedCar = await this.carService.deleteSoftCar(carId);
      return { message: 'Car deleted successfully', deletedCar };
    } catch (error) {
      throw new HttpException(
        { message: 'Error deleting car', error: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('car/:carId')
  async getCarbyid(@Param('carId') carId: string) {
    try {
      const car = await this.carService.getCarById(carId);
      return car;
    } catch (error) {
      throw new HttpException(
        { message: 'Error deleting car', error: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
