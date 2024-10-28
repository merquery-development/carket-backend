import {
  Body,
  Controller,
  forwardRef,
  HttpException,
  HttpStatus,
  Inject,
  Post,
  UploadedFile,
  UploadedFiles,
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
import { AuthService } from '../services/auth.service';
import { FileUploadService } from '../services/file.service';
import {
  UploadBrandDto,
  UploadCarPicturesDto,
  UploadCategoryDto,
} from '../utils/dto/car.dto';
@ApiBearerAuth('defaultBearerAuth')
@ApiTags('upload')
@Controller('upload')
export class FileUploadController {
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
  @Post('category-logo')
  @ApiOperation({ summary: 'Upload normal and active logos for category' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Upload logos for category',
    schema: {
      type: 'object',
      properties: {
        logo: { type: 'string', format: 'binary' }, // โลโก้ธรรมดา
        logoActive: { type: 'string', format: 'binary' }, // โลโก้ตอน active
        id: { type: 'integer' }, // ID ของหมวดหมู่
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Logos uploaded successfully',
  })
  @ApiResponse({ status: 400, description: 'Invalid file or file too large' })
  @ApiResponse({ status: 500, description: 'File upload failed' })
  @UseInterceptors(AnyFilesInterceptor()) // ใช้ AnyFilesInterceptor สำหรับการรับไฟล์
  async uploadCategoryLogo(
    @Body() body: UploadCategoryDto,
    @UploadedFiles() files: Array<Express.Multer.File>, // รับไฟล์ทั้งหมด
  ) {
    try {
      // ตรวจสอบว่าได้รับไฟล์โลโก้หรือไม่
      const logo = files.find((file) => file.fieldname === 'logo'); // โลโก้ธรรมดา
      const logoActive = files.find((file) => file.fieldname === 'logoActive'); // โลโก้ active

      if (!logo || !logoActive) {
        throw new HttpException(
          'Both logo and logoActive files are required',
          HttpStatus.BAD_REQUEST,
        );
      }

      // เรียกใช้ service เพื่ออัปโหลดโลโก้
      const result = await this.fileUploadService.uploadCategoryLogo(
        Number(body.id),
        logo,
        logoActive,
      );

      return result;
    } catch (error) {
      throw new HttpException(
        error.message || 'File upload failed',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  @Post('brand-logo')
  @UseInterceptors(FileInterceptor('logo')) // ใช้ FileInterceptor สำหรับการรับไฟล์
  @ApiOperation({ summary: 'Upload logo for brand' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Upload logo for brand',
    type: 'multipart/form-data',
    schema: {
      type: 'object',
      properties: {
        logo: { type: 'string', format: 'binary' }, // โลโก้แบรนด์
        id: { type: 'integer' }, // ID ของหมวดหมู่
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Logo uploaded successfully',
  })
  @ApiResponse({ status: 400, description: 'Invalid file or file too large' })
  @ApiResponse({ status: 500, description: 'File upload failed' })
  async uploadBrandLogo(
    @Body() body: UploadBrandDto, // รับข้อมูลจาก body
    @UploadedFile() logo: Express.Multer.File, // รับไฟล์โลโก้
  ) {
    try {
     

      // ตรวจสอบว่าได้รับไฟล์โลโก้หรือไม่
      if (!logo) {
        throw new HttpException(
          'Logo file is required',
          HttpStatus.BAD_REQUEST,
        );
      }

      // เรียกใช้ service เพื่ออัปโหลดโลโก้
      const result = await this.fileUploadService.uploadBrandLogo(
        Number(body.id),
        logo,
      );

      return result;
    } catch (error) {
      throw new HttpException(
        error.message || 'File upload failed',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
