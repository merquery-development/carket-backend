import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CarService } from '../services/car.service';
import { CreateCarDto } from '../utils/car.dto';
import { AuthGuard } from '../guards/auth.guard';
@ApiTags('cars')
@Controller('cars')
@ApiBearerAuth('defaultBearerAuth')
@UseGuards(AuthGuard)
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
  @ApiOperation({ summary: 'get all car' })
  getCar() {
    return this.carService.getAllCar();
  }
}
