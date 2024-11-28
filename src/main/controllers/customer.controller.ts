import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Req,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CustomerService } from '../services/customer.service';
import { CreateCustomerDto } from '../utils/dto/customer.dto';
@ApiTags('customers')
@Controller('customers')
@ApiBearerAuth('defaultBearerAuth')
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @Post('')
  @ApiOperation({ summary: 'Register Customer' })
  @ApiCreatedResponse({
    description: 'The record has been successfully created.',
    type: CreateCustomerDto,
  })
  createCustomer(@Body() postData: CreateCustomerDto) {
    return this.customerService.createCustomer(postData);
  }

  @Get('')
  @ApiOperation({ summary: 'List all customer' })
  getAllCustomer() {
    return this.customerService.getCustomer();
  }
  //later
  @Get('favorites/:customerUid')
  @ApiOperation({ summary: 'Get customer favorites' })
  @ApiOkResponse({ description: 'List of favorite cars for the customer.' })
  getCustomerFavorites(@Param('customerUid') customerUid: string) {
    return this.customerService.getCustomerFavorites(customerUid);
  }
  //later
  @Post('favorites/:carpostId')
  @ApiOperation({ summary: 'Add a car to customer favorites' })
  @ApiBearerAuth()
  @ApiResponse({
    status: 201,
    description: 'Car successfully added to favorites',
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async addFavoriteCar(
    @Req() request: Request,
    @Param('carpostId') carpostId: number,
  ) {
    const token = request.headers['authorization']?.split(' ')[1];

    try {
      await this.customerService.addFavoriteCar(token, carpostId);
      return { message: 'Car successfully added to favorites' };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Get('liked-cars')
  @ApiBearerAuth() // Indicates that this endpoint requires a token
  @ApiOperation({
    summary: 'Get liked cars',
    description:
      'Retrieve the list of cars liked by the authenticated customer.',
  })
  @ApiResponse({
    status: 200,
    description: 'List of liked cars retrieved successfully.',
    schema: {
      example: {
        message: 'Car successfully added to favorites',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized access, token is missing or invalid.',
    schema: {
      example: {
        statusCode: 401,
        message: 'Token is required',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Failed to retrieve liked cars.',
    schema: {
      example: {
        statusCode: 400,
        message: 'Failed to add car to favorites',
      },
    },
  })
  async getLikedCar(@Req() request: Request) {
    const token = request.headers['authorization']?.split(' ')[1];
    try {
      return await this.customerService.getLikedCar(token);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
