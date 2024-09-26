import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiCreatedResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { VendorService } from '../services/vendor.service';
import { CreateVendorUserDto } from '../utils/vendor.dto';
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
  @Get('id/:id')
  getStaffById(@Param('id') id: string) {
    return this.vendorService.getVendorByid(id);
  }
}
