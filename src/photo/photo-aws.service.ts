import { Injectable } from '@nestjs/common';
import { S3 } from 'aws-sdk';
import { v4 as uuid } from 'uuid';
import { promisify } from 'util';

@Injectable()
export class PhotoAwsService {
  constructor() {}

  async uploadPublicFile(
    photoId: string,
    dataBuffer: Buffer,
    filename: string,
  ) {
    const s3 = new S3();
    return await s3
      .upload({
        Bucket: 'gallery-nestjs',
        Body: dataBuffer,
        Key: `${photoId}-${filename}`,
      })
      .promise();
  }

  async getOne(key: string) {
    const s3 = new S3();
    return s3
      .getObject({
        Bucket: 'gallery-nestjs',
        Key: key,
      })
      .promise();
  }
}
