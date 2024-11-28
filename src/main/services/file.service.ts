import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3,
  S3ClientConfig,
} from '@aws-sdk/client-s3';
import {
  forwardRef,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
} from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

import { AuthService } from './auth.service';
import { CarService } from './car.service';
import { VendorService } from './vendor.service';

@Injectable()
export class FileUploadService {
  private s3: S3;

  constructor(
    @Inject(forwardRef(() => VendorService))
    private readonly vendorService: VendorService,
    @Inject(forwardRef(() => CarService))
    private readonly carService: CarService,
    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService,
  ) {
    const s3ClientConfig: S3ClientConfig = {
      region: 'auto', // Set the appropriate region
      endpoint: process.env.ENDPOINT,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
      },
      forcePathStyle: true, // Needed for R2
    };
    this.s3 = new S3(s3ClientConfig);
  }
  async uploadCarPictures(
    files: Express.Multer.File[] | Buffer[],
    carId: number,
  ): Promise<string[]> {
    const carPictures = [];

    for (const file of files) {
      const uid = uuidv4();
      let fileExtension: string;
      let fileBuffer: Buffer;

      if (file instanceof Buffer) {
        fileBuffer = file;
        fileExtension = 'png'; // Default to PNG for Buffer input
      } else {
        fileBuffer = file.buffer;
        fileExtension = file.mimetype.split('/')[1].toLowerCase();
      }

      const allowedExtensions = ['jpg', 'jpeg', 'png'];
      const maxSizeInBytes = 1000 * 1024; // 500KB

      if (fileBuffer.length > maxSizeInBytes) {
        throw new HttpException(
          'File size exceeds 500KB limit.',
          HttpStatus.BAD_REQUEST,
        );
      }

      if (!allowedExtensions.includes(fileExtension)) {
        throw new HttpException(
          'Invalid file type. Only jpg, jpeg, and png are allowed.',
          HttpStatus.BAD_REQUEST,
        );
      }

      const folderPath = 'pictures/car';
      const imageName = `${uid}.${fileExtension}`;
      const key = `${folderPath}/${imageName}`;

      try {
        const command = new PutObjectCommand({
          Bucket: process.env.BUCKET,
          Key: key,
          Body: fileBuffer,
          ContentType: `image/${fileExtension}`,
        });

        await this.s3.send(command);

        const envUrl =
          process.env.S3_PUBLIC_URL || 'https://your-r2-public-url';
        const imageUrl = `${envUrl}/${key}`;

        carPictures.push(imageUrl);

        // Store in database
        await this.carService.updateCarPicture(
          Number(carId),
          imageName,
          folderPath,
        );
      } catch (error) {
        throw new HttpException(
          `File upload failed: ${error.message}`,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }

    return carPictures;
  }
  async uploadCategoryLogo(id: number, logo: Express.Multer.File) {
    const allowedExtensions = ['jpg', 'jpeg', 'png', 'svg', 'svg+xml'];
    const maxSizeInBytes = 500 * 1024; // 500KB

    // ตรวจสอบประเภทไฟล์และขนาด
    let logoExtension = logo.mimetype.split('/')[1].toLowerCase();
    if (logoExtension === 'svg+xml') {
      logoExtension = 'svg'; // Normalize for consistent handling
    }

    if (
      logo.size > maxSizeInBytes ||
      !allowedExtensions.includes(logoExtension)
    ) {
      throw new HttpException('Invalid logo file', HttpStatus.BAD_REQUEST);
    }


    const logoOriginalname = logo.originalname.split('.')[0].toLowerCase();
    const folderPath = 'logos/category';
    const logoName = `${logoOriginalname}.${logoExtension}`;
    const logoKey = `${folderPath}/${logoName}`;
    const envUrl = process.env.S3_PUBLIC_URL || 'https://your-r2-public-url';
    const logoUrl = `${envUrl}/${logoKey}`;
   
    try {
      // อัปโหลดโลโก้ไปยัง S3
   await this.s3.send(
        new PutObjectCommand({
          Bucket: process.env.BUCKET,
          Key: logoKey,
          Body: logo.buffer,
          ContentType: 'image/svg+xml', // กำหนดให้ SVG แสดงผลได้ในเบราว์เซอร์
          ContentDisposition: 'inline', // บังคับให้แสดงผลในเบราว์เซอร์

        }),
      );

      // ดึงข้อมูลหมวดหมู่รถ
      const category = await this.carService.getCategoryByCarId(id);
      if(category){
      if (category.logoName) {
        // ลบโลโก้เดิมออกจาก S3
        const oldLogoKey = `${folderPath}/${category.logoName}`;
        try {
          await this.s3.send(
            new DeleteObjectCommand({
              Bucket: process.env.BUCKET,
              Key: oldLogoKey,
            }),
          );
        } catch (deleteError) {
          console.warn(`Failed to delete old logo: ${deleteError.message}`);
        }
      }
    }
      // อัปเดตโลโก้ในฐานข้อมูล
      await this.carService.updateCategoryLogo(
        id,
        `/${logoName}`,
        `/${folderPath}`,
      );
    

      return { message: logoUrl };
    } catch (error) {
      throw new HttpException(
        `File upload failed: ${error}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async uploadBrandLogo(
    id: number,
    logo: Express.Multer.File,
    logoLight: Express.Multer.File,
  ) {
    const allowedExtensions = ['jpg', 'jpeg', 'png'];
    const maxSizeInBytes = 500 * 1024; // 500KB

    // ตรวจสอบไฟล์โลโก้ธรรมดา
    const logoExtension = logo.mimetype.split('/')[1].toLowerCase();

    if (
      logo.size > maxSizeInBytes ||
      !allowedExtensions.includes(logoExtension)
    ) {
      throw new HttpException('Invalid logo file', HttpStatus.BAD_REQUEST);
    }
    const logoLightExtension = logoLight.mimetype.split('/')[1].toLowerCase();
    if (
      logoLight.size > maxSizeInBytes ||
      !allowedExtensions.includes(logoExtension)
    ) {
      throw new HttpException('Invalid logo file', HttpStatus.BAD_REQUEST);
    }

    const logoOriginalname = logo.originalname.split('.')[0].toLowerCase();
    const logoLightOriginalname = logoLight.originalname
      .split('.')[0]
      .toLowerCase();
    // กำหนด path สำหรับ brand
    const folderPathDark = 'logos/brand/dark';
    const folderPathLight = 'logos/brand/light';

    // สร้างชื่อไฟล์สำหรับโลโก้ธรรมดาและโลโก้ active
    const logoName = `${logoOriginalname}.${logoExtension}`;
    const logoKey = `${folderPathDark}/${logoName}`;
    const logoLightName = `${logoLightOriginalname}.${logoLightExtension}`;
    const logoLightkey = `${folderPathLight}/${logoLightName}`;

    try {
      // อัปโหลดโลโก้ธรรมดา
      await this.s3.send(
        new PutObjectCommand({
          Bucket: process.env.BUCKET,
          Key: logoKey,
          Body: logo.buffer,
          ContentType: `image/${logoExtension}`,
        }),
      );
      await this.s3.send(
        new PutObjectCommand({
          Bucket: process.env.BUCKET,
          Key: logoLightkey,
          Body: logoLight.buffer,
          ContentType: `image/${logoLightExtension}`,
        }),
      );

      await this.carService.updateBrandLogo(
        id,
        '/' + logoName,
        '/' + folderPathDark,
        '/' + logoLightName,
        '/' + folderPathLight,
      );
      const envUrl = process.env.S3_PUBLIC_URL || 'https://your-r2-public-url';
      const logoUrl = `${envUrl}/${logoKey}`;
      const logoLightUrl = `${envUrl}/${logoLightkey}`;

      return `Logos uploaded: ${logoUrl},${logoLightUrl}`;
    } catch (error) {
      throw new HttpException(
        `File upload failed: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async uploadVendorBanner(
    files: Express.Multer.File[] | Buffer[],
    vendorId: number,
  ): Promise<string[]> {
    const bannerImages = [];

    for (const file of files) {
      const uid = uuidv4();
      let fileExtension: string;
      let fileBuffer: Buffer;

      if (file instanceof Buffer) {
        fileBuffer = file;
        fileExtension = 'png'; // Default to PNG for Buffer input
      } else {
        fileBuffer = file.buffer;
        fileExtension = file.mimetype.split('/')[1].toLowerCase();
      }

      const allowedExtensions = ['jpg', 'jpeg', 'png'];
      const maxSizeInBytes = 5000 * 1024; // 500KB

      if (fileBuffer.length > maxSizeInBytes) {
        throw new HttpException(
          'File size exceeds 500KB limit.',
          HttpStatus.BAD_REQUEST,
        );
      }

      if (!allowedExtensions.includes(fileExtension)) {
        throw new HttpException(
          'Invalid file type. Only jpg, jpeg, and png are allowed.',
          HttpStatus.BAD_REQUEST,
        );
      }

      const folderPath = 'pictures/vendor_banners';
      const imageName = `${uid}.${fileExtension}`;
      const key = `${folderPath}/${imageName}`;

      try {
        const command = new PutObjectCommand({
          Bucket: process.env.BUCKET,
          Key: key,
          Body: fileBuffer,
          ContentType: `image/${fileExtension}`,
        });

        await this.s3.send(command);

        const envUrl =
          process.env.S3_PUBLIC_URL || 'https://your-r2-public-url';
        const imageUrl = `${envUrl}/${key}`;

        bannerImages.push(imageUrl);

        // Store in VendorBanner model
        await this.vendorService.updateVendorBanner(
          vendorId,
          folderPath,
          imageName,
        );
      } catch (error) {
        throw new HttpException(
          `Banner upload failed: ${error.message}`,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }

    return bannerImages;
  }

  async uploadVendorUserProfile(
    file: Express.Multer.File | Buffer,
    token: string,
  ): Promise<string> {
    const uid = uuidv4();
    let fileExtension: string;
    let fileBuffer: Buffer;

    // ตรวจสอบประเภทของไฟล์
    if (file instanceof Buffer) {
      fileBuffer = file;
      fileExtension = 'png'; // Default to PNG สำหรับ Buffer input
    } else {
      fileBuffer = file.buffer;
      fileExtension = file.mimetype.split('/')[1].toLowerCase();
    }
   
    const profile = await this.authService.getProfile(token);
 
    const allowedExtensions = ['jpg', 'jpeg', 'png'];
    const maxSizeInBytes = 10000 * 1024; // 500KB

    // ตรวจสอบขนาดไฟล์
    if (fileBuffer.length > maxSizeInBytes) {
      throw new HttpException(
        'File size exceeds 500KB limit.',
        HttpStatus.BAD_REQUEST,
      );
    }

    // ตรวจสอบชนิดของไฟล์
    if (!allowedExtensions.includes(fileExtension)) {
      throw new HttpException(
        'Invalid file type. Only jpg, jpeg, and png are allowed.',
        HttpStatus.BAD_REQUEST,
      );
    }

    const folderPath = 'pictures/vendor_user_profiles';
    const imageName = `${uid}.${fileExtension}`;
    const key = `${folderPath}/${imageName}`;
   

    try {
      // อัปโหลดไปยัง S3
      const command = new PutObjectCommand({
        Bucket: process.env.BUCKET,
        Key: key,
        Body: fileBuffer,
        ContentType: `image/${fileExtension}`,
      });

      await this.s3.send(command);

      // สร้าง URL รูปโปรไฟล์
      const envUrl = process.env.S3_PUBLIC_URL || 'https://your-r2-public-url';
      const imageUrl = `${envUrl}/${key}`;

      // อัปเดตข้อมูลในฐานข้อมูล
      await this.vendorService.updateVendorUserProfile(
        profile.vendoruid,
        folderPath,
        imageName,
      );

      return imageUrl;
    } catch (error) {
      throw new HttpException(
        `Profile upload failed: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  }
