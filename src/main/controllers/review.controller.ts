import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiParam } from '@nestjs/swagger';
import { CustomerService } from '../services/customer.service';
import { CreateReviewDto } from '../utils/dto/review.dto';

@ApiTags('reviews') // Marks this controller as a 'reviews' tag in Swagger
@Controller('reviews')
export class ReviewController {
  constructor(private readonly customerService: CustomerService) {}

  @ApiOperation({ summary: 'Create a new customer review' })
  @ApiBody({ type: CreateReviewDto, description: 'Details for creating a review' })
  @ApiResponse({ status: 201, description: 'Review created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid rating or data' })
  @Post()
  async createReview(@Body() createReviewDto: CreateReviewDto) {
    return await this.customerService.createReview(createReviewDto);
  }

  @ApiOperation({ summary: 'Get reviews by customer ID' })
  @ApiParam({ name: 'customerId', type: Number, description: 'Customer ID to fetch reviews' })
  @ApiResponse({ status: 200, description: 'List of customer reviews' })
  @ApiResponse({ status: 404, description: 'Customer not found' })
  @Get(':customerId')
  async getReviewsByCustomer(@Param('customerId') customerId: number) {
    return await this.customerService.getReviewsByCustomer(customerId);
  }

  @ApiOperation({ summary: 'Get average rating for a customer' })
  @ApiParam({ name: 'customerId', type: Number, description: 'Customer ID to calculate average rating' })
  @ApiResponse({ status: 200, description: 'Average rating of customer' })
  @ApiResponse({ status: 404, description: 'Customer not found' })
  @Get(':customerId/average')
  async getAverageRating(@Param('customerId') customerId: number) {
    return await this.customerService.getAverageRating(customerId);
  }
}