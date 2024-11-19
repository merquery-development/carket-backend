import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
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
import { FileUploadService } from '../../services/file.service';
import { UploadBrandDto, UploadCategoryDto } from '../../utils/dto/car.dto';
@ApiBearerAuth('defaultBearerAuth')
@ApiTags('upload')
@Controller('upload')
export class FileUploadController {
  constructor(private readonly fileUploadService: FileUploadService) {}

  @Post('category-logo')
  @ApiOperation({ summary: 'Upload normal and active logos for category' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Upload logos for category',
    schema: {
      type: 'object',
      properties: {
        logo: { type: 'string', format: 'binary' }, // โลโก้ธรรมดา
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

      if (!logo) {
        throw new HttpException(
          'Both logo and logoActive files are required',
          HttpStatus.BAD_REQUEST,
        );
      }

      // เรียกใช้ service เพื่ออัปโหลดโลโก้
      const result = await this.fileUploadService.uploadCategoryLogo(
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
  @Post('brand-logo')
  @UseInterceptors(AnyFilesInterceptor()) // ใช้ AnyFilesInterceptor สำหรับการรับไฟล์
  @ApiOperation({ summary: 'Upload logo for brand' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Upload logo for brand',
    type: 'multipart/form-data',
    schema: {
      type: 'object',
      properties: {
        logo: { type: 'string', format: 'binary' }, // โลโก้ธรรมดา
        logoLight: { type: 'string', format: 'binary' }, // โลโก้ตอน active
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
    @UploadedFiles() files: Array<Express.Multer.File>, // รับไฟล์ทั้งหมด
  ) {
    const logo = files.find((file) => file.fieldname === 'logo'); // โลโก้ธรรมดา
    const logoLight = files.find((file) => file.fieldname === 'logoLight'); // โลโก้ active
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
        logoLight,
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
