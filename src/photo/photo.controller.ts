import {
  Controller,
  UseInterceptors,
  UploadedFile,
  Post,
  Get,
  Body,
  InternalServerErrorException,
  Param,
} from '@nestjs/common';
import { diskStorage } from 'multer';
import { FileInterceptor } from '@nestjs/platform-express';
import { PhotoService } from './photo.service';
import { v4 as uuid } from 'uuid';
import { ValidateId } from './interceptors/validateId.interceptor';

@Controller('photo')
export class PhotoController {
  constructor(private photoService: PhotoService) {}

  @Post(':id')
  @UseInterceptors(
    ValidateId,
    FileInterceptor('image', {
      storage: diskStorage({
        destination: (req: Express.Request, file: any, cb) =>
          cb(null, './public/uploads'),
        filename: (req: Express.Request, file: any, cb) => {
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
    const fileName = file.filename.split('.')[0];
    try {
      await this.photoService.saveImages(fileName, file.mimetype, file.path);
    } catch (e) {
      throw new InternalServerErrorException();
    }
  }
}
