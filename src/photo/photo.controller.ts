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
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { PhotoService } from './photo.service';
import { ValidateId } from './interceptors/validateId.interceptor';
import { ImageDto } from './dto/image.dto';
import { PaginationDto } from './dto/pagination.dto';
import { PhotoAwsService } from './photo-aws.service';

@Controller('photo')
export class PhotoController {
  constructor(
    private photoService: PhotoService,
    private readonly photoAwsService: PhotoAwsService,
  ) {}

  @Get('resize')
  async getImage(
    @Query('id') id: string,
    @Query('size') size: string,
    @Res() res: any,
  ) {
    try {
      const result = await this.photoService.findByIdAndSize(id, size);
      if (result) {
        const file = await this.photoAwsService.getOne(result.url);
        res.writeHead(200, {
          'Content-Type': 'image/' + file.Metadata.format || 'jpeg',
          'Content-disposition': 'attachment;filename=' + result.photo.name,
        });

        res.end(Buffer.from(file.Body as any, 'binary'));
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
        const file = await this.photoAwsService.getOne(result.url);
        res.writeHead(200, {
          'Content-Type': 'image/' + file.Metadata.format || 'jpeg',
          'Content-disposition': 'attachment;filename=' + result.photo.name,
        });

        res.end(Buffer.from(file.Body as any, 'binary'));
      } else {
        throw new BadRequestException(
          `${photoId} with size ${size} was not found`,
        );
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
      throw new InternalServerErrorException();
    }
  }
}
