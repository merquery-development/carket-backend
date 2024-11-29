import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString, Min } from 'class-validator';

export class CreateSubsciptionDto {
  @ApiProperty({
    example: 'gold',
  })
  @IsString()
  packageName: string;

  @ApiProperty({
    example: 150,
  })
  @IsInt()
  @Min(0)
  carPostSlot: number;
  @ApiProperty({
    example: 20000,
  })
  @IsInt()
  @Min(0)
  price: number;
  @ApiProperty({
    example: 365,
  })
  @IsInt()
  @Min(0)
  durationInDay: number;
}
