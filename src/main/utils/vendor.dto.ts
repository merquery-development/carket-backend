import { ApiProperty } from '@nestjs/swagger';
import {
  IsDate,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
export class CreateVendorUserDto {
  @IsString()
  @IsOptional()
  id: string;
  
  @IsString()
  @IsNotEmpty()
  vendorId: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: 'testuser',
  })
  username: string;

  @IsEmail() 
  @ApiProperty({
    example: 'testemail',
  })
 email: string;

  @IsString()
  @IsNotEmpty() 
  @ApiProperty({
    example: 'testpassword',
  })
  password: string;

  @IsString()
  @IsNotEmpty()
  roleId: string;

  @IsDate()
  @IsOptional()
  updateAt: Date;
}
