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
  Query,
  Res,
  NotFoundException,
} from '@nestjs/common';
import { diskStorage } from 'multer';
import { FileInterceptor } from '@nestjs/platform-express';
import { PhotoService } from './photo.service';
import { v4 as uuid } from 'uuid';
import { ValidateId } from './interceptors/validateId.interceptor';
import { ImageDto } from './dto/image.dto';
import { PaginationDto } from './dto/pagination.dto';

@Controller('photo')
export class PhotoController {
  constructor(private photoService: PhotoService) {}

  @Get('resize')
  async getImage(
    @Query('id') id: string,
    @Query('size') size: string,
    @Res() res: any,
  ) {
    try {
      const result = await this.photoService.findByIdAndSize(id, size);
      if (result) {
        res.sendFile(result.url, { root: './' }, err => {
          if (err) {
            res.sendStatus(404);
          }
        });
      } else {
        throw new BadRequestException(`${id} with size ${size} was not found`);
      }
    } catch (e) {
      throw new BadRequestException(`${id} with size ${size} was not found`);
    }
  }

  @Get()
  findAndPaginate(@Query() pagination: PaginationDto) {
    pagination.page = Number(pagination.page);
    pagination.limit = Number(pagination.limit);

    return this.photoService.findAll({
      ...pagination,
      limit: pagination.limit < 10 ? 10 : pagination.limit,
    });
  }

  @Get('download/:id')
  async downloadImage(@Param('id') photoId: string, @Res() res) {
    try {
      const result = await this.photoService.findByIdAndSize(
        photoId,
        'original',
      );
      if (result) {
        const lastIndex = result.url.lastIndexOf('.');
        const ext = result.url.slice(lastIndex + 1, result.url.length);

        res.header('Content-Disposition', 'attachment; filename=' + result.id);
        res.header('Content-Type', `image/${ext}`);
        res.sendFile(result.url, { root: './' }, error => {
          if (error) res.sendStatus(404);
        });
      } else {
        throw new NotFoundException(`${photoId}  was not found`);
      }
    } catch (e) {
      throw new BadRequestException(`${photoId} was not found`);
    }
  }

  @Post()
  async savePhoto(@Body() photo: ImageDto) {
    try {
      return await this.photoService.save(photo);
    } catch (e) {
      if (e.name === 'QueryFailedError')
        throw new BadRequestException('Category id was not found');
      else {
        throw new InternalServerErrorException();
      }
    }
  }

  @Post(':id')
  @UseInterceptors(
    ValidateId,
    FileInterceptor('image', {
      storage: diskStorage({
        destination: (_: any, __: any, cb: any) => cb(null, './public/uploads'),
        filename: (_: any, file: any, cb: any) => {
          const [, ext] = file.mimetype.split('/');
          cb(null, `${uuid()}.${ext}`); // rename file as uuid() + ext
        },
      }),
      limits: {
        files: 1,
        fileSize: 1e7, // set file limit to 100mb
      },
    }),
  )
  async uploadFile(
    @Param('id') id: string,
    @UploadedFile()
    file: any,
  ) {
    if (!file) {
      throw new BadRequestException('field >image< is required');
    }

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
