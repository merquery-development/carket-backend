import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SubscriptionService } from '../services/subscription.service';
import { CreateSubsciptionDto } from '../utils/dto/subscription.dtos';

@ApiTags('subscript')
@Controller('subscript')
export class SubscriptionControllers {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new subscription package' })
  @ApiResponse({
    status: 201,
    description: 'Subscription package created successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async createSubscript(@Body() createSub: CreateSubsciptionDto) {
    return this.subscriptionService.createSubscript(createSub);
  }

  @Get()
  @ApiOperation({ summary: 'Get all subscription packages' })
  @ApiResponse({
    status: 200,
    description: 'List of subscription packages',
    type: [CreateSubsciptionDto],
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async getSubSciption() {
    return this.subscriptionService.getSubSciption();
  }
}
