import { Injectable } from '@nestjs/common';
import * as sharp from 'sharp';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Photo } from './entities/photo.entity';
import { Sizes } from './entities/sizes';
import { ImageDto } from './dto/image.dto';

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

  async save(image: ImageDto, imageSavedPath: string) {
    try {
      const savedImage = await this.photoRepository.save(image);
      await this.sizeRepository.save({
        url: `${this.folderPath}${imageSavedPath}`,
        size: 'original',
        photo: savedImage,
      });

      return savedImage;
    } catch (error) {
      throw new Error('Error to performe save operation');
    }
  }

  async saveImages(name: string, mimetype: string, filePath: string) {
    const [, ext] = mimetype.split('/');

    const thumbnails = this.widths.map(async width => {
      return await sharp(filePath)
        .resize({ width })
        .toFile(`./${this.folderPath}/${name}x${width}.${ext}`);
    });

    try {
      return await Promise.all(thumbnails);
    } catch (e) {
      console.log(e);
    }
  }
}
