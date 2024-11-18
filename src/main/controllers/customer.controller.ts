import {
  Body,
  Controller,
  forwardRef,
  Get,
  HttpException,
  HttpStatus,
  Inject,
  Param,
  Post,
  Req,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiHeader,
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthService } from '../services/auth.service';
import { CustomerService } from '../services/customer.service';
import { CreateCustomerDto } from '../utils/dto/customer.dto';
@ApiTags('customers')
@Controller('customers')
@ApiBearerAuth('defaultBearerAuth')
export class CustomerController {
  constructor(
    private readonly customerService: CustomerService,
    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService,
  ) {}

  @Post('')
  @ApiOperation({ summary: 'Create customer' })
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
  @Get('favorites/:customerUid')
  @ApiOperation({ summary: 'Get customer favorites' })
  @ApiOkResponse({ description: 'List of favorite cars for the customer.' })
  getCustomerFavorites(@Param('customerUid') customerUid: string) {
    return this.customerService.getCustomerFavorites(customerUid);
  }

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
    
    const token = request.headers['authorization']?.split(' ')[1]

    try {
      
      
      await this.customerService.addFavoriteCar(token, carpostId);
      return { message: 'Car successfully added to favorites' };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }
}
