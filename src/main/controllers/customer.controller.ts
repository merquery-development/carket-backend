import {
  BadRequestException,
  Body,
  Controller,
  forwardRef,
  Get,
  HttpCode,
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
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthService } from '../services/auth.service';
import { CustomerService } from '../services/customer.service';
import { CreateCustomerDto } from '../utils/dto/customer.dto';
import { extractTokenFromHeader } from '../utils/token.util';
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
  @ApiOperation({ summary: 'Register Customer' })
  @ApiCreatedResponse({
    description: 'The record has been successfully created.',
    type: CreateCustomerDto,
  })
  createCustomer(@Body() postData: CreateCustomerDto) {
    return this.customerService.createCustomer(postData);
  }
  // @UseGuards(GoogleAuthGuard)
  @Get('')
  @ApiOperation({ summary: 'List all customer' })
  getAllCustomer() {
    return this.customerService.getCustomer();
  }

  @Get('favorites/:customerUid')
  @ApiOperation({ summary: 'Get customer favorites ไม่ต้อง login' })
  @ApiOkResponse({ description: 'List of favorite cars for the customer.' })
  getCustomerFavorites(@Param('customerUid') customerUid: string) {
    return this.customerService.getCustomerFavorites(customerUid);
  }

  @Post('add-favorites/:carpostId')
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
    summary: 'Get liked cars แบบ login ',
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
  @Post('toggle-car/:postId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Toggle favorite status for a car post' })
  @ApiParam({
    name: 'postId',
    type: Number,
    description: 'ID of the car post to toggle favorite',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully toggled favorite status.',
  })
  @ApiResponse({ status: 400, description: 'Invalid input or bad request.' })
  async toggleFavorite(
    @Param('postId') postId: number,
    @Req() request: Request,
  ) {
    const token = extractTokenFromHeader(request);
    const profile = await this.authService.getProfile(token);

    return await this.customerService.toggleFavoriteCarPost(
      profile.customeruid,
      Number(postId),
    );
  }
  //New--------------------------------------------------------------------

  @Get('liked/:customerUid')
  @ApiOperation({ summary: 'Get customer’s favorite list ไม่ต้อง login' })
  @ApiOkResponse({ description: 'List of favorite vendors for the customer.' })
  getCustomerLiked(@Param('customerUid') customerUid: string) {
    return this.customerService.getCustomerLikeVendor(customerUid);
  }
  
  @Post('add-liked/:vendorId')
  @ApiOperation({ summary: 'Add a vendor to customer’s favorites' })
  @ApiBearerAuth()
  @ApiResponse({
    status: 201,
    description: 'Vendor successfully added to favorites.',
  })
  @ApiResponse({ status: 400, description: 'Invalid request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized access.' })
  async addLikedVendor(
    @Req() request: Request,
    @Param('vendorId') vendorId: number,
  ) {
    const token = request.headers['authorization']?.split(' ')[1];
  
    try {
      await this.customerService.addLikeVendor(token, vendorId);
      return { message: 'Vendor successfully added to favorites.' };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }
  
  @Get('liked-vendor')
  @ApiBearerAuth() 
  @ApiOperation({
    summary: 'Retrieve liked vendors (login vendor) เอารถที่ไลค์ทั้งหมดของcustomerที่ login',
    description: 'Get a list of vendors favorited by the authenticated customer.',
  })
  @ApiResponse({
    status: 200,
    description: 'Liked vendors retrieved successfully.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized, token is missing or invalid.',
  })
  @ApiResponse({
    status: 400,
    description: 'Failed to retrieve liked vendors.',
  })
  async getLikedVendor(@Req() request: Request) {
    const token = request.headers['authorization']?.split(' ')[1];
    
    try {
      return await this.customerService.getLikeVendor(token);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
  
  @Post('toggle-vendor/:vendorId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Toggle favorite status for a vendor' })
  @ApiParam({
    name: 'vendorId',
    type: Number,
    description: 'The ID of the vendor to toggle favorite status.',
  })
  @ApiResponse({
    status: 200,
    description: 'Favorite status toggled successfully.',
  })
  @ApiResponse({ status: 400, description: 'Invalid input or request.' })
  async toggleLikedVendor(
    @Param('vendorId') vendorId: number,
    @Req() request: Request,
  ) {
    const token = extractTokenFromHeader(request);
    const profile = await this.authService.getProfile(token);
  
    return await this.customerService.toggleFavoriteVendor(
      profile.customeruid,
      Number(vendorId),
    );
  }}