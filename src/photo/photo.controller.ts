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
import { FileInterceptor } from '@nestjs/platform-express';
import { PhotoService } from './photo.service';
import { ValidateId } from './interceptors/validateId.interceptor';
import { ImageDto } from './dto/image.dto';
import { PaginationDto } from './dto/pagination.dto';
import { PhotoAwsService } from './photo-aws.service';
import { combineLatest } from 'rxjs';

@Controller('photo')
export class PhotoController {
  constructor(
    private photoService: PhotoService,
    private readonly photoAwsService: PhotoAwsService,
  ) {}

  @Get('image')
  async getOne(@Res() res) {
    const e = await this.photoAwsService.getOne('');
    res.writeHead(200, {
      'Content-Type': 'image/jpeg',
      'Content-disposition': 'attachment;filename=' + 'gary.jpeg',
    });

    res.end(Buffer.from(e.Body as any, 'binary'));
  }

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

  @Get('download/:id/:size')
  async downloadImage(
    @Param('id') photoId: string,
    @Param('size') size: string,
    @Res() res,
  ) {
    try {
      const result = await this.photoService.findByIdAndSize(photoId, size);
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
  @UseInterceptors(ValidateId, FileInterceptor('image'))
  async uploadFile(
    @Param('id') id: string,
    @UploadedFile()
    file: any,
  ) {
    if (!file) {
      throw new BadRequestException('field >image< is required');
    }

    try {
      const buckedStoredImages = this.photoService.saveImage({
        file: file.buffer,
        name: file.originalname,
        mimetype: file.mimetype,
        photoId: id,
      });

      return buckedStoredImages;
    } catch (e) {
      console.log(e);
      throw new InternalServerErrorException();
    }
  }
}
