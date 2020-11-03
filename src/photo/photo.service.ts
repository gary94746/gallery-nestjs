import { Injectable } from '@nestjs/common';
import * as sharp from 'sharp';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Photo } from './entities/photo.entity';
import { Sizes } from './entities/sizes.entity';
import { ImageDto } from './dto/image.dto';
import { Category } from './entities/category.entity';
import { PaginationDto } from './dto/pagination.dto';
import { from, combineLatest } from 'rxjs';
import { map, flatMap } from 'rxjs/operators';
import { S3 } from 'aws-sdk';

@Injectable()
export class PhotoService {
  widths = [150, 250, 350, 450];

  constructor(
    @InjectRepository(Photo)
    private readonly photoRepository: Repository<Photo>,
    @InjectRepository(Sizes)
    private readonly sizeRepository: Repository<Sizes>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  async findAll(pagination: PaginationDto) {
    const skippedItems = (pagination.page - 1) * pagination.limit;

    const totalCount = await this.photoRepository.count();
    const photos = await this.photoRepository.find({
      relations: ['categories'],
      skip: skippedItems,
      take: pagination.limit,
      order: {
        createdAt: 'DESC',
      },
    });

    return {
      totalCount,
      page: pagination.page,
      limit: pagination.limit,
      data: photos,
    };
  }

  async findAllCategories() {
    return this.categoryRepository.find();
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
      relations: ['photo'],
    });
  }

  async findByIdAndSizeRelation(id: string, size: string) {
    return this.sizeRepository.findOne({
      where: {
        size,
        photo: id,
      },
      relations: ['photo'],
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

  async saveSize(photoId: string, path: string, size: string) {
    const photo = new Photo();
    photo.id = photoId;

    return await this.sizeRepository.save([{ url: path, size, photo }]);
  }

  async saveToBucked(Body: Buffer, Key: string, format: string, size: string) {
    const s3 = new S3();
    return s3
      .upload({
        Bucket: 'gallery-nestjs',
        Body,
        Key,
        Metadata: {
          format,
          size,
        },
      })
      .promise();
  }

  saveImage(file: {
    name: string;
    mimetype: string;
    file: Buffer;
    photoId: string;
  }) {
    const photo = new Photo();
    photo.id = file.photoId;

    // save into bucked and database
    const originalFile = from(
      this.saveToBucked(
        file.file,
        `${file.photoId}.${this.getFileExtention(file.name)}`,
        this.getFileExtention(file.name),
        'original',
      ),
    ).pipe(
      flatMap(image => this.saveSize(file.photoId, image.Key, 'original')),
    );

    const thumbnailsImgs = from(this.widths).pipe(
      // resize image with current width
      flatMap(width =>
        sharp(file.file)
          .resize({ width })
          .toBuffer({ resolveWithObject: true }),
      ),
      flatMap(data =>
        // save the rezised image in to the bucket
        this.saveToBucked(
          data.data,
          this.getComposedFileName(
            data.info.width,
            file.photoId,
            data.info.format,
          ),
          data.info.format,
          data.info.width.toString(),
        ),
      ),
      map(uploadedFile =>
        // save into db
        this.saveSize(
          file.photoId,
          uploadedFile.Key,
          this.getSizeFromKey(uploadedFile.Key),
        ),
      ),
    );

    // return the original image and the generated thumbnails images
    return combineLatest(originalFile, thumbnailsImgs);
  }

  getComposedFileName(width: number, photoId: string, format: string) {
    return `${photoId}x${width}.${format}`;
  }

  getSizeByIndex(index: number) {
    return this.widths[index];
  }

  getFileExtention(fileName: string) {
    const lastDot = fileName.lastIndexOf('.') + 1;
    return fileName.slice(lastDot, fileName.length);
  }

  getSizeFromKey(key: string) {
    const lastX = key.lastIndexOf('x');
    return key.slice(lastX + 1, lastX + 4);
  }
}
