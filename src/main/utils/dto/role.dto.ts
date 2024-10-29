import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class CreateRoleDto {
  @ApiProperty({ description: 'The name of the role' })
  @IsString()
  name: string;
}

export class UpdateRoleDto {
  @ApiProperty({ description: 'The name of the role', required: false })
  @IsString()
  @IsOptional()
  name?: string;
}