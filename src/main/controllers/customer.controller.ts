import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiCreatedResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateVendorUserDto } from '../utils/dto/vendor.dto';
import { CustomerService } from '../services/customer.service';
import { CreateCustomerDto } from '../utils/dto/customer.dto';
@ApiTags('customers')
@Controller('customers')
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @Post('')
  @ApiOperation({ summary: 'Create customer' })
  @ApiCreatedResponse({
    description: 'The record has been successfully created.',
    type: CreateCustomerDto,
  })
  createCustomer(@Body() postData: CreateCustomerDto) {
    return this.customerService.createCustomer(postData);
  }

}
