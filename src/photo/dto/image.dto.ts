import { IsNotEmpty, IsString, Length, Max } from 'class-validator';

export class ImageDto {
  @IsNotEmpty()
  @IsString()
  @Length(10, 300)
  alt_description: string;

  @IsNotEmpty()
  @IsString()
  @Length(10, 300)
  name: string;

  @IsNotEmpty()
  @IsString()
  @Length(10, 500)
  description: string;

  @IsNotEmpty()
  @IsString()
  @Length(10, 300)
  category: string;
}
