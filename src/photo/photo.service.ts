import { Injectable } from '@nestjs/common';
import * as sharp from 'sharp';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Photo } from './entities/photo.entity';
import { Sizes } from './entities/sizes';
import { ImageDto } from './dto/image.dto';
import { Category } from './entities/category';
import { PaginationDto } from './dto/pagination.dto';

@Injectable()
export class PhotoService {
  widths = [150, 250, 350, 450];
  folderPath = 'public/uploads/';

  constructor(
    @InjectRepository(Photo)
    private readonly photoRepository: Repository<Photo>,
    @InjectRepository(Sizes)
    private readonly sizeRepository: Repository<Sizes>,
  ) {}

  async findAll(pagination: PaginationDto) {
    const skippedItems = (pagination.page - 1) * pagination.page;

    const totalCount = await this.photoRepository.count();
    const photos = await this.photoRepository
      .createQueryBuilder()
      .orderBy('"createdAt"', 'DESC')
      .offset(skippedItems)
      .limit(pagination.limit)
      .getMany();

    return {
      totalCount,
      page: pagination.page,
      limit: pagination.limit,
      data: photos,
    };
  }

  async findById(id: string) {
    return await this.photoRepository.findOne({
      id,
    });
  }

  async findByIdAndSize(id: string, size: string) {
    return this.sizeRepository.findOne({
      where: {
        size,
        photo: id,
      },
    });
  }

  async save(image: ImageDto) {
    const categories = image.categories.map(({ id }) => {
      const category = new Category();
      category.id = id;
      return category;
    });
    image.categories = categories;

    return await this.photoRepository.save(image);
  }

  async saveSize(photoId: string, path: string, size: string = 'original') {
    const photo = new Photo();
    photo.id = photoId;

    return await this.sizeRepository.save([{ url: './' + path, size, photo }]);
  }

  async saveImages(
    name: string,
    mimetype: string,
    filePath: string,
    photoId: string,
  ) {
    const [, ext] = mimetype.split('/');

    const path = (width: number) =>
      `./${this.folderPath}/${name}x${width}.${ext}`;

    const thumbnails = this.widths.map(async width => {
      return await sharp(filePath)
        .resize({ width })
        .toFile(path(width));
    });

    try {
      const thumbnailsInfo = await Promise.all(thumbnails);

      const photo = new Photo();
      photo.id = photoId;

      const mapedThumbnails = thumbnailsInfo.map(info => {
        return {
          url: path(info.width),
          size: info.width.toString(),
          photo,
        };
      });

      await this.sizeRepository.save(mapedThumbnails);
    } catch (e) {
      console.log(e);
    }
  }
}
