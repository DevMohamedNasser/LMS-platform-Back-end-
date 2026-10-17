import {
  ObjectCannedACL,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { env } from "../../Config/config.service";
import { MulterStorageEnum } from "../enums/multer/cloud.enum";
import { createReadStream } from "node:fs";
import { Upload } from "@aws-sdk/lib-storage";
import chalk from "chalk";

export class S3Service {
  // S3 connection
  private client: S3Client; // الكلاينت شايل ال connection بيني وبين AWS
  constructor() {
    this.client = new S3Client({
      region: "us-east-1",
      credentials: {
        accessKeyId: env.ACCESS_KEY,
        secretAccessKey: env.SECRET_ACCESS_KEY,
      },
    });
  }

  async uploadFile({
    storageKey = MulterStorageEnum.MemoryStorage,
    Bucket = env.BUCKET_NAME, // جبته م aws s3 buckets لقيت اسمه
    path = "general",
    file,
    ACL = ObjectCannedACL.private,
    contentType,
  }: {
    storageKey?: MulterStorageEnum;
    Bucket?: string;
    path?: string;
    file: Express.Multer.File;
    ACL?: ObjectCannedACL;
    contentType?: string;
  }) {
    // const key = `LMS/${path}/${Math.round(Math.random() * 1e9)}-${file.originalname}`; // unique name + file path
    const key = `${path}/${file.originalname}`;
    const result = await this.client.send(
      new PutObjectCommand({
        Bucket,
        Key: key,
        Body:
          storageKey === MulterStorageEnum.MemoryStorage
            ? file.buffer
            : createReadStream(file.path),
        ACL,
        ContentType: contentType,
      }),
    );
    return key;
  }

  async uploadBigFile({
    storageKey = MulterStorageEnum.MemoryStorage,
    Bucket = env.BUCKET_NAME, // جبته م aws s3 buckets لقيت اسمه
    path = "general",
    file,
    ACL = ObjectCannedACL.private,
    contentType,
    partSize = 5,
  }: {
    storageKey?: MulterStorageEnum;
    Bucket?: string;
    path?: string;
    file: Express.Multer.File;
    ACL?: ObjectCannedACL;
    contentType?: string;
    partSize?: number;
  }) {
    // const key = `LMS/${path}/${Math.round(Math.random() * 1e9)}-${file.originalname}`; // unique name + file path
    const key = `${path}/${file.originalname}`;
    const result = new Upload({
      // Upload تاخد الفايل الكبير as buffers تبعته لل aws لانها شغاله بال stream
      client: this.client,
      params: {
        Bucket,
        Key: key,
        ACL,
        Body:
          storageKey === MulterStorageEnum.MemoryStorage
            ? file.buffer
            : createReadStream(file.path),
        ContentType: contentType,
      },
      partSize: partSize * 1024 * 1024,
    });
    result.on("httpUploadProgress", (progress) => {
      console.log(
        chalk.green(
          `${((progress.loaded as number) / (progress.total as number)) * 100}%`,
        ),
      );
    });
    await result.done();
    return key;
  }
}

export default new S3Service();
