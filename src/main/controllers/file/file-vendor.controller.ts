import {
  Body,
  Controller,
  forwardRef,
  HttpException,
  HttpStatus,
  Inject,
  Post,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthService } from 'src/main/services/auth.service';
import { FileUploadService } from 'src/main/services/file.service';
import { UploadCarPicturesDto } from 'src/main/utils/dto/car.dto';
import { UploadVendorBannerDto } from 'src/main/utils/dto/vendor.dto';

@ApiBearerAuth('defaultBearerAuth')
@ApiTags('vendor-upload')
@Controller('vendor-upload')
export class FileVendorUploadController {
  constructor(
    private readonly fileUploadService: FileUploadService,
    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService,
  ) {}

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
        },
        vendorId: {
          type: 'integer',
          description: 'ID of the vendor for which banners are being uploaded',
        },
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
    @Body() body: UploadVendorBannerDto,
  ): Promise<{ urls: string[] }> {
    const { vendorId } = body;

    // Validate files and vendorId presence
    if (!files || files.length === 0) {
      throw new HttpException('No files uploaded', HttpStatus.BAD_REQUEST);
    }

    if (!vendorId) {
      throw new HttpException('Vendor ID is required', HttpStatus.BAD_REQUEST);
    }

    try {
      // Call the service to upload banner images
      const fileUrls = await this.fileUploadService.uploadVendorBanner(
        files,
        Number(vendorId),
      );

      return { urls: fileUrls };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
