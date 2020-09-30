import {
  Controller,
  UseInterceptors,
  UploadedFile,
  Post,
  Get,
  Res,
} from '@nestjs/common';
import { diskStorage } from 'multer';
import { FileInterceptor } from '@nestjs/platform-express';
import { PhotoService } from './photo.service';
import { v4 as uuid } from 'uuid';

@Controller('photo')
export class PhotoController {
  sizes: string[];

  constructor(private photoService: PhotoService) {}

  @Get()
  async getImage(@Res() res: any) {}

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
  ) {
    const fileName = file.filename.split('.')[0];

    return await this.photoService.saveImages(
      fileName,
      file.mimetype,
      file.path,
    );
  }
}
