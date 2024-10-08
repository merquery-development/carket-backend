import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { VendorService } from '../services/vendor.service';
import { CreateVendorUserDto } from '../utils/dto/vendor.dto';
@ApiTags('vendors')
@Controller('vendors')
export class VendorController {
  constructor(private readonly vendorService: VendorService) {}

  @Post('')
  @ApiOperation({ summary: 'Create vendor' })
  @ApiCreatedResponse({
    description: 'The record has been successfully created.',
    type: CreateVendorUserDto,
  })
  createVendor(@Body() postData: CreateVendorUserDto) {
    return this.vendorService.createVendorUser(postData);
  }
  @Get('uid/:uid')
  getStaffById(@Param('uid') uid: string) {
    return this.vendorService.getVendorByuid(uid);
  }
  @Get('vendor')
  @HttpCode(200)
  @ApiOperation({ summary: 'Get All Data of vendor require login' })
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
  getStaff(
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
}
