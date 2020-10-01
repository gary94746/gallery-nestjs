import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PhotoModule } from './photo/photo.module';
import { Photo } from './photo/entities/photo.entity';
import { Category } from './photo/entities/category';
import { MulterModule } from '@nestjs/platform-express';
import { Sizes } from './photo/entities/sizes';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'postgres',
      database: 'postgres',
      entities: [Photo, Category, Sizes],
      synchronize: true,
    }),
    PhotoModule,
    MulterModule.register(),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
