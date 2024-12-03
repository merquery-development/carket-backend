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
  async uploadCategoryLogos(
    id: number,
    files: { logo?: Express.Multer.File; logoActive?: Express.Multer.File },
  ) {
 
    const allowedExtensions = ['jpg', 'jpeg', 'png', 'svg', 'svg+xml'];
    const maxSizeInBytes = 500 * 1024; // 500KB
    const folderPath = 'logos/category';
    const folderPathActive = 'logos/category/active';
    const envUrl = process.env.S3_PUBLIC_URL || 'https://your-r2-public-url';
  
    const uploadLogo = async (file: Express.Multer.File, logoKey: string) => {
      let logoExtension = file.mimetype.split('/')[1].toLowerCase();
 
  
      if (file.size > maxSizeInBytes || !allowedExtensions.includes(logoExtension)) {
        throw new HttpException('Invalid logo file', HttpStatus.BAD_REQUEST);
      }
;
    
      await this.s3.send(
        new PutObjectCommand({
          Bucket: process.env.BUCKET,
          Key: logoKey,
          Body: file.buffer,
          ContentType: 'image/svg+xml', // กำหนดให้ SVG แสดงผลได้ในเบราว์เซอร์
          ContentDisposition: 'inline',
        }),
      );
    };
  
    try {
      const category = await this.carService.getCategoryById(id);
  
      let normalLogoUrl: string | null = null;
      let activeLogoUrl: string | null = null;
  
    
      if (files.logo) {
        let logoExtension = files.logo.mimetype.split('/')[1].toLowerCase();
        if (logoExtension === 'svg+xml') {
          logoExtension = 'svg'; // Normalize for consistent handling
        }
        const normalLogoName = `${files.logo.originalname.split('.')[0].toLowerCase()}.${
         logoExtension
        }`;
        const normalLogoKey = `${folderPath}/${normalLogoName}`;
        normalLogoUrl = `${envUrl}/${normalLogoKey}`;
        await uploadLogo(files.logo, normalLogoKey);
  
        if (category?.logoName) {
    
          const oldNormalLogoKey = `${folderPath}/${category.logoName}`;
          await this.s3.send(
            new DeleteObjectCommand({
              Bucket: process.env.BUCKET,
              Key: oldNormalLogoKey,
            }),
          );
        }
     
      
      }
  
 
      if (files.logoActive) {
        let logoExtension = files.logoActive.mimetype.split('/')[1].toLowerCase();
        if (logoExtension === 'svg+xml') {
          logoExtension = 'svg'; // Normalize for consistent handling
        }
        const activeLogoName = `${files.logoActive.originalname.split('.')[0].toLowerCase()}.${
          logoExtension
        }`;
        const activeLogoKey = `${folderPathActive}/${activeLogoName}`;
        activeLogoUrl = `${envUrl}/${activeLogoKey}`;
        await uploadLogo(files.logoActive, activeLogoKey);

  
        if (category?.logoNameActive) {
       
          const oldActiveLogoKey = `${folderPathActive}/${category.logoNameActive}`;
          await this.s3.send(
            new DeleteObjectCommand({
              Bucket: process.env.BUCKET,
              Key: oldActiveLogoKey,
            }),
          );
        }
      
      

      
 
      await this.carService.updateCategoryLogo(id, {
        logoName: normalLogoUrl ? `/${files.logo.originalname.split('.')[0].toLowerCase()}` : category.logoName,
        logoPath: normalLogoUrl ? `/${folderPath}` : category.logoPath,
        logoNameActive: activeLogoUrl ? `/${activeLogoName}`: category.logoNameActive,
        logoPathActive: activeLogoUrl ? `/${folderPathActive}` : category.logoPathActive,
      });
    }
      return {
        ...(normalLogoUrl && { normalLogoUrl }),
        ...(activeLogoUrl && { activeLogoUrl }),
      };
    } catch (error) {
      throw new HttpException(
        `File upload failed: ${error.message}`,
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
