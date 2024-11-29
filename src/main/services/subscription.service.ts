import { BadRequestException, Inject, Injectable, forwardRef } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { AuthService } from './auth.service';
import { CreateSubsciptionDto } from '../utils/dto/subscription.dtos';

@Injectable()
export class SubscriptionService {
  constructor(
    private readonly prisma: PrismaService,

    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService,
  ) {}

  async createSubscript(createSub: CreateSubsciptionDto) {
    try {
           await  this.prisma.subscriptionPackage.create({
              data : {
                ...createSub
              }
            })
            return {message : "create subscription complete"}
    } catch (error) {
      throw new BadRequestException(error.message)
    }
  }

 async getSubSciption(){
  try {
    const result = await this.prisma.subscriptionPackage.findMany()
    return result
  } catch (error) {
    throw new BadRequestException(error.message)
  }
 }


}
