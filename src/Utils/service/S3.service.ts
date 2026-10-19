import {
  DeleteObjectCommand,
  GetObjectCommand,
  ObjectCannedACL,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { env } from "../../Config/config.service";
import { MulterStorageEnum } from "../enums/multer/cloud.enum";
import { createReadStream } from "node:fs";
import { Upload } from "@aws-sdk/lib-storage";
import chalk from "chalk";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { randomUUID } from "node:crypto";

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

  async getFile({
    Bucket = env.BUCKET_NAME,
    key,
  }: {
    Bucket?: string;
    key: string;
  }) {
    const file = new GetObjectCommand({
      Bucket,
      Key: key,
    }); // get file from AWS

    return await this.client.send(file); // Access file from AWS & send it to me
  }

  //  pre signed url to make the load on the client device instead of my server
  async createPreSignedUrl({
    Bucket = env.BUCKET_NAME,
    path = "general",
    ContentType,
    Key,
    Expires = 60 * 2,
    Originalname,
  }: {
    Bucket?: string;
    path?: string;
    ContentType?: string;
    Key?: string;
    Expires?: number;
    Originalname?: string;
  }) {
    const key = `${path}/${randomUUID()}-${Originalname}`;
    const result = new PutObjectCommand({
      Bucket,
      Key: key,
      ContentType,
    });

    const url = await getSignedUrl(this.client, result, { expiresIn: Expires });
    return { url, key };
  }

  async createGetPreSignedUrl({
    Bucket = env.BUCKET_NAME,
    Key,
    Expires = 60 * 5,
  }: {
    Bucket?: string;
    Key: string;
    Expires?: number;
  }) {
    const command = new GetObjectCommand({
      Bucket,
      Key,
      ResponseContentDisposition: "inline", // inline علشان المتصفح يقدر يعرض الصورة أو الفيديو بدل ما يطلب تحميله مباشرة
    });

    const url = await getSignedUrl(this.client, command, {
      expiresIn: Expires,
    });

    return url;
  }

  async deleteFile({
    Bucket = env.BUCKET_NAME,
    key,
  }: {
    Bucket?: string;
    key: string;
  }) {
    const result = new DeleteObjectCommand({
      Bucket,
      Key: key,
    });
    return await this.client.send(result);
  }
}

export default new S3Service();
