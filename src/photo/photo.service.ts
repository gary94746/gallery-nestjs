import { Injectable } from '@nestjs/common';
import * as sharp from 'sharp';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Photo } from './entities/photo.entity';
import { Sizes } from './entities/sizes';
import { ImageDto } from './dto/image.dto';
import { Category } from './entities/category';

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
    const categories = image.category.map(({ id }) => {
      const category = new Category();
      category.id = id;
      return category;
    });

    return await this.photoRepository.save({
      ...image,
      categories,
    });
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
