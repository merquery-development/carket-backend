import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Post,
  Req,
  UnauthorizedException,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AnyFilesInterceptor, FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { EmailVerifiedGuard } from 'src/main/guards/verified.guard';
import { FileUploadService } from 'src/main/services/file.service';
import { UploadCarPicturesDto } from 'src/main/utils/dto/car.dto';
import { UploadVendorBannerDto } from 'src/main/utils/dto/vendor.dto';

@ApiBearerAuth('defaultBearerAuth')
@ApiTags('vendor-upload')
@Controller('vendor-upload')
export class FileVendorUploadController {
  constructor(private readonly fileUploadService: FileUploadService) {}
  @UseGuards(EmailVerifiedGuard)
  @Post('car-pictures')
  @UseInterceptors(AnyFilesInterceptor())
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Upload multiple car pictures',
    type: 'multipart/form-data',
    schema: {
      type: 'object',
      properties: {
        filename: {
          type: 'array',
          items: { type: 'string', format: 'binary' },
        },
        carId: { type: 'integer' }, // Include carId field in form-data
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Car pictures upload successful',
  })
  async uploadCarPictures(
    @UploadedFiles() files: Array<Express.Multer.File>,
    @Body() body: UploadCarPicturesDto,
  ) {
    try {
      // ตรวจสอบว่าได้รับไฟล์และ carId หรือไม่
      if (!files || files.length === 0) {
        throw new HttpException('No files uploaded', HttpStatus.BAD_REQUEST);
      }

      if (!body.carId) {
        throw new HttpException('Car ID is required', HttpStatus.BAD_REQUEST);
      }

      // เรียกใช้ service เพื่ออัปโหลดรูปภาพหลายไฟล์
      const fileUrls = await this.fileUploadService.uploadCarPictures(
        files,
        Number(body.carId),
      );

      return { urls: fileUrls };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Post('upload-banner')
  @UseInterceptors(AnyFilesInterceptor())
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Upload multiple vendor banner images',
    type: 'multipart/form-data',
    schema: {
      type: 'object',
      properties: {
        files: {
          type: 'array',
          items: { type: 'string', format: 'binary' },
        }
      },
    },
  })
  @ApiOperation({ summary: 'Upload vendor banners' })
  @ApiResponse({ status: 200, description: 'Vendor banners upload successful' })
  @ApiResponse({
    status: 400,
    description: 'No files uploaded or Vendor ID missing',
  })
  @ApiResponse({
    status: 500,
    description: 'File upload failed due to an internal error',
  })
  async uploadVendorBanner(
    @UploadedFiles() files: Array<Express.Multer.File>,
    @Req() request: Request,
  ): Promise<{ urls: string[] }> {
   
    const authorization = request.headers['authorization'];

    if (!authorization || !authorization.startsWith('Bearer ')) {
      throw new UnauthorizedException('Invalid authorization header');
    }
    const token = authorization.substring(7);
    // Validate files and vendorId presence
    if (!files || files.length === 0) {
      throw new HttpException('No files uploaded', HttpStatus.BAD_REQUEST);
    }

  

    try {
      // Call the service to upload banner images
      const fileUrls = await this.fileUploadService.uploadVendorBanner(
        files,
        token
      );

      return { urls: fileUrls };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
  @Post('upload-profile')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Upload a single vendor user profile picture',
    type: 'multipart/form-data',
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Profile picture to upload',
        },
      },
    },
  })
  @ApiOperation({ summary: 'Upload vendor user profile picture' })
  @ApiResponse({
    status: 200,
    description: 'Profile picture upload successful',
  })
  @ApiResponse({
    status: 400,
    description: 'No file uploaded or User ID missing',
  })
  @ApiResponse({
    status: 500,
    description: 'File upload failed due to an internal error',
  })
  async uploadVendorUserProfile(
    @UploadedFile() file: Express.Multer.File,
    @Req() request: Request,
  ): Promise<{ url: string }> {
    const authorization = request.headers['authorization'];

    if (!authorization || !authorization.startsWith('Bearer ')) {
      throw new UnauthorizedException('Invalid authorization header');
    }
    const token = authorization.substring(7);
    // ตรวจสอบ file และ userId
    if (!file) {
      throw new HttpException('No file uploaded', HttpStatus.BAD_REQUEST);
    }

    try {
      // เรียก Service สำหรับอัปโหลดรูปโปรไฟล์
      const profileUrl = await this.fileUploadService.uploadVendorUserProfile(
        file,
       token,
      );

      return { url: profileUrl };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('upload-store')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Upload a single vendor user profile picture',
    type: 'multipart/form-data',
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Profile picture to upload',
        },
      },
    },
  })
  @ApiOperation({ summary: 'Upload vendor store  picture' })
  @ApiResponse({
    status: 200,
    description: 'store picture upload successful',
  })
  @ApiResponse({
    status: 400,
    description: 'No file uploaded or User ID missing',
  })
  @ApiResponse({
    status: 500,
    description: 'File upload failed due to an internal error',
  })
  async uploadVendorStore(
    @UploadedFile() file: Express.Multer.File,
    @Req() request: Request,
  ): Promise<{ url: string }> {
    const authorization = request.headers['authorization'];

    if (!authorization || !authorization.startsWith('Bearer ')) {
      throw new UnauthorizedException('Invalid authorization header');
    }
    const token = authorization.substring(7);
    // ตรวจสอบ file และ userId
    if (!file) {
      throw new HttpException('No file uploaded', HttpStatus.BAD_REQUEST);
    }

    try {
      // เรียก Service สำหรับอัปโหลดรูปโปรไฟล์
      const profileUrl = await this.fileUploadService.uploadVendorStoreImage(
        file,
       token,
      );

      return { url: profileUrl };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
