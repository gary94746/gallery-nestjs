import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category } from './entities/category';
import { Photo } from './entities/photo.entity';
import { PhotoService } from './photo/photo.service';

@Module({
  imports: [TypeOrmModule.forFeature([Photo, Category])],
  providers: [PhotoService],
})
export class PhotoModule {}
