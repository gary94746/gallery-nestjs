import {
  Controller,
  UseInterceptors,
  UploadedFile,
  Post,
  Get,
  Body,
  InternalServerErrorException,
  Param,
  BadRequestException,
} from '@nestjs/common';
import { diskStorage } from 'multer';
import { FileInterceptor } from '@nestjs/platform-express';
import { PhotoService } from './photo.service';
import { v4 as uuid } from 'uuid';
import { ValidateId } from './interceptors/validateId.interceptor';
import { ImageDto } from './dto/image.dto';

@Controller('photo')
export class PhotoController {
  constructor(private photoService: PhotoService) {}

  @Post()
  async savePhoto(@Body() photo: ImageDto) {
    return this.photoService.save(photo);
  }

  @Post(':id')
  @UseInterceptors(
    ValidateId,
    FileInterceptor('image', {
      storage: diskStorage({
        destination: (_: any, __: any, cb: any) => cb(null, './public/uploads'),
        filename: (_: any, file: any, cb: any) => {
          const [, ext] = file.mimetype.split('/');
          cb(null, `${uuid()}.${ext}`);
        },
      }),
      limits: {
        files: 1,
        fileSize: 1e7, // 100mb
      },
    }),
  )
  async uploadFile(
    @Param('id') id: string,
    @UploadedFile()
    file: any,
  ) {
    if (!file) throw new BadRequestException('field >image< is required');

    const fileName = file.filename.split('.')[0];
    try {
      await this.photoService.saveSize(id, file.path);
      await this.photoService.saveImages(
        fileName,
        file.mimetype,
        file.path,
        id,
      );
    } catch (e) {
      throw new InternalServerErrorException();
    }
  }
}
