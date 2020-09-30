import { Injectable } from '@nestjs/common';
import * as sharp from 'sharp';

@Injectable()
export class PhotoService {
  widths = [150, 250, 350, 450];

  constructor() {}

  async saveImages(name: string, mimetype: string, filePath: string) {
    const path = `${process.cwd()}/public/uploads`;
    const [, ext] = mimetype.split('/');

    const thumbnails = this.widths.map(async width => {
      return await sharp(filePath)
        .resize({ width })
        .toFile(`${path}/${name}x${width}.${ext}`);
    });

    try {
      return await Promise.all(thumbnails);
    } catch (e) {
      console.log(e);
    }
  }
}
