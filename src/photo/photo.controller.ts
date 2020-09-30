import {
  Controller,
  UseInterceptors,
  UploadedFile,
  Post,
  Get,
  Body,
  InternalServerErrorException,
} from '@nestjs/common';
import { diskStorage } from 'multer';
import { FileInterceptor } from '@nestjs/platform-express';
import { PhotoService } from './photo.service';
import { v4 as uuid } from 'uuid';
import { ImageDto } from './dto/image.dto';

@Controller('photo')
export class PhotoController {
  constructor(private photoService: PhotoService) {}

  @Post()
  @UseInterceptors(
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
    @UploadedFile()
    file: any,
    @Body() photo: ImageDto,
  ) {
    const fileName = file.filename.split('.')[0];
    try {
      const image = await this.photoService.save(photo, file.path);
      await this.photoService.saveImages(fileName, file.mimetype, file.path);

      return image;
    } catch (e) {
      throw new InternalServerErrorException();
    }
  }
}
