import { Injectable } from '@nestjs/common';
import { S3 } from 'aws-sdk';
import { v4 as uuid } from 'uuid';
import { promisify } from 'util';

@Injectable()
export class PhotoAwsService {
  constructor() {}

  async uploadPublicFile(dataBuffer: Buffer, filename: string) {
    const s3 = new S3();
    const uploadResult = await s3
      .upload({
        Bucket: 'gallery-nestjs',
        Body: dataBuffer,
        Key: `${uuid()}-${filename}`,
      })
      .promise();

    /*    const newFile = this.publicFilesRepository.create({*/
    //key: uploadResult.Key,
    //url: uploadResult.Location,
    //});
    /*await this.publicFilesRepository.save(newFile);*/
    return 'created';
  }

  async getOne(key: string) {
    const s3 = new S3();
    return s3
      .getObject({
        Bucket: 'gallery-nestjs',
        Key: '3119a516-b1fe-4aac-b815-99bb19ae3519-1833299.jpg',
      })
      .promise();
  }
}
