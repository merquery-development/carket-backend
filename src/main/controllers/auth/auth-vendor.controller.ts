import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Inject,
  Post,
  Query,
  Req,
  Res,
  UnauthorizedException,
  forwardRef,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { log } from 'console';
import { Request } from 'express';
import * as jwt from 'jsonwebtoken';
import { AuthService } from 'src/main/services/auth.service';
import { MailerService } from 'src/main/services/mailer.service';
import { VendorService } from 'src/main/services/vendor.service';
@ApiTags('auth-vendor')
@Controller('auth-vendor')
export class AuthVendorController {
  constructor(
    private readonly authService: AuthService,
    @Inject(forwardRef(() => VendorService))
    private readonly vendorService: VendorService,
    @Inject(forwardRef(() => MailerService))
    private readonly mailerService: MailerService,
  ) {}

  @Post('login-vendor')
  @ApiOperation({ summary: 'Sign in with username or email and password' })
  @ApiResponse({ status: 200, description: 'Successfully signed in' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        identifier: {
          type: 'String',
          example: 'testuser',
          description: 'this is username',
        },
        password: {
          type: 'String',
          example: 'testpassword',
          description: 'this is password',
        },
      },
    },
  })
  @HttpCode(200)
  signInVendor(@Body() signInDto: Record<string, any>) {
    return this.authService.signInVendor(
      signInDto.identifier,
      signInDto.password,
    );
  }
  @Get('verify-email')
  async verifyEmail(@Query('token') token: string, @Res() res) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      
      const userId = decoded['uid'];
    
      
      // Activate user account
      await this.vendorService.verifyEmail(userId);

      return res.send('Email successfully verified!');
    } catch (error) {
      
      
      return res.status(400).send('Invalid or expired token.');
    }
  }

  @Post('send-verification')
  @ApiOperation({
    summary: 'Send email verification link',
    description:
      'Sends an email verification link to the specified email address.',
  })
  @ApiBody({
    description: 'The email address to send the verification link to.',
    schema: {
      type: 'object',
      properties: {
        email: {
          type: 'array',
          example: 'user@example.com',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Verification email sent successfully',
    schema: {
      example: {
        message: 'Verification email sent successfully',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request, email is required',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized, invalid token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden, token not provided',
  })
  @ApiBearerAuth('defaultBearerAuth')
  async sendVerification(
    @Body('email') email: string,
    @Req() request: Request,
  ) {
    if (!email) {
      throw new HttpException('Email is required', HttpStatus.BAD_REQUEST);
    }

    // ดึง tokenProfile จาก Header Authorization
    const tokenProfile = request.headers.authorization?.split(' ')[1];
    if (!tokenProfile) {
      throw new ForbiddenException('No token provided');
    }

    // ดึงข้อมูลโปรไฟล์จาก token
    const profile = await this.authService.getProfile(tokenProfile);
    if (!profile) {
      throw new UnauthorizedException('Invalid token');
    }

    // สร้าง Email Verification Token
    const token = await this.authService.generateEmailVerificationToken(
      profile.vendoruid,
    );
 
    // // ส่งอีเมล
    await this.mailerService.sendVerificationEmail(email, token);

    return { message: 'Verification email sent successfully' };
  }
}
