import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { VendorService } from '../services/vendor.service';
import {
  CreateVendorDto,
  CreateVendorUserDto,
  UpdateVendorDto,
} from '../utils/dto/vendor.dto';
@ApiTags('vendors')
@Controller('vendors')
export class VendorController {
  constructor(private readonly vendorService: VendorService) {}

  @Post('user')
  @ApiOperation({ summary: 'Register Vendor User' })
  @ApiCreatedResponse({
    description: 'The record has been successfully created.',
    type: CreateVendorUserDto,
  })
  createVendorUser(@Body() postData: CreateVendorUserDto) {
    return this.vendorService.createVendorUser(postData);
  }
  @ApiOperation({ summary: 'Retrieve vendoruser by uid' })
  @Get('user/uid/:uid')
  getVendorUserById(@Param('uid') uid: string) {
    return this.vendorService.getVendorUserByuid(uid);
  }
  @Get('user')
  @HttpCode(200)
  @ApiOperation({ summary: 'Get All Data of vendor user that verified email' })
  @ApiOkResponse({
    description: 'All vendor list',
  })
  @ApiNotFoundResponse({
    description: 'result not found',
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal Server Error',
  })
  @ApiQuery({
    name: 'name',
    required: false,
    type: String,
    description: 'Filter by name',
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
  getVendorUser(
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('name') name?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'asc' | 'desc',
  ) {
    const pageNumber = page ? parseInt(page, 10) : null;
    const limitNumber = pageSize ? parseInt(pageSize, 10) : null;

    return this.vendorService.getVendors({
      page: pageNumber,
      pageSize: limitNumber,
      name,
      sortBy,
      sortOrder,
    });
  }
  @Post('')
  @ApiOperation({ summary: 'Register a new vendor' })
  @ApiResponse({ status: 201, description: 'Vendor registration successful.' })
  @ApiResponse({ status: 400, description: 'Error registering vendor.' })
  createVendor(@Body() vendorDto: CreateVendorDto) {
    try {
      const createVendor = this.vendorService.createVendor(vendorDto);
      return { message: 'Register Vendor Success' };
    } catch (error) {
      throw new HttpException(
        { message: 'Error register Vendor', error: error.message },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  // @UseGuards(AdminGuard) //only admin from vendor can do
  @Put('id/:id')
  @ApiOperation({ summary: 'Update an existing vendor' })
  @ApiResponse({ status: 200, description: 'Vendor updated successfully.' })
  @ApiResponse({ status: 400, description: 'Error updating vendor.' })
  updateVendor(@Param('id') id: string, @Body() updateDto: UpdateVendorDto) {
    try {
      console.log();

      if (Number(id) <= 0) {
        throw new BadRequestException('Id incorrect');
      }

      const updateVendor = this.vendorService.updateVendor(
        Number(id),
        updateDto,
      );
    } catch (error) {
      throw new HttpException(
        { message: 'Error update Vendor', error: error.message },
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
