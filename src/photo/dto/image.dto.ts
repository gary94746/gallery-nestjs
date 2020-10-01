import {
  IsNotEmpty,
  IsString,
  Length,
  IsArray,
  ValidateNested,
  IsUUID,
  ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';

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

  @IsArray()
  @ValidateNested({ each: true })
  @IsNotEmpty()
  @ArrayMinSize(1)
  @Type(() => UUIDCategory)
  categories: UUIDCategory[];
}

export class UUIDCategory {
  @IsUUID('4')
  id: string;
}
