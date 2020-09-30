import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category } from './entities/category';
import { Photo } from './entities/photo.entity';
import { PhotoController } from './photo.controller';
import { PhotoService } from './photo.service';
import { Sizes } from './entities/sizes';

@Module({
  imports: [TypeOrmModule.forFeature([Photo, Category, Sizes])],
  providers: [PhotoService],
  controllers: [PhotoController],
})
export class PhotoModule {}
