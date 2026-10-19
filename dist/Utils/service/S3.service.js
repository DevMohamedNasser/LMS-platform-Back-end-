"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.S3Service = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
const config_service_1 = require("../../Config/config.service");
const cloud_enum_1 = require("../enums/multer/cloud.enum");
const node_fs_1 = require("node:fs");
const lib_storage_1 = require("@aws-sdk/lib-storage");
const chalk_1 = __importDefault(require("chalk"));
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
const node_crypto_1 = require("node:crypto");
class S3Service {
    // S3 connection
    client; // الكلاينت شايل ال connection بيني وبين AWS
    constructor() {
        this.client = new client_s3_1.S3Client({
            region: "us-east-1",
            credentials: {
                accessKeyId: config_service_1.env.ACCESS_KEY,
                secretAccessKey: config_service_1.env.SECRET_ACCESS_KEY,
            },
        });
    }
    async uploadFile({ storageKey = cloud_enum_1.MulterStorageEnum.MemoryStorage, Bucket = config_service_1.env.BUCKET_NAME, // جبته م aws s3 buckets لقيت اسمه
    path = "general", file, ACL = client_s3_1.ObjectCannedACL.private, contentType, }) {
        // const key = `LMS/${path}/${Math.round(Math.random() * 1e9)}-${file.originalname}`; // unique name + file path
        const key = `${path}/${file.originalname}`;
        const result = await this.client.send(new client_s3_1.PutObjectCommand({
            Bucket,
            Key: key,
            Body: storageKey === cloud_enum_1.MulterStorageEnum.MemoryStorage
                ? file.buffer
                : (0, node_fs_1.createReadStream)(file.path),
            ACL,
            ContentType: contentType,
        }));
        return key;
    }
    async uploadBigFile({ storageKey = cloud_enum_1.MulterStorageEnum.MemoryStorage, Bucket = config_service_1.env.BUCKET_NAME, // جبته م aws s3 buckets لقيت اسمه
    path = "general", file, ACL = client_s3_1.ObjectCannedACL.private, contentType, partSize = 5, }) {
        // const key = `LMS/${path}/${Math.round(Math.random() * 1e9)}-${file.originalname}`; // unique name + file path
        const key = `${path}/${file.originalname}`;
        const result = new lib_storage_1.Upload({
            // Upload تاخد الفايل الكبير as buffers تبعته لل aws لانها شغاله بال stream
            client: this.client,
            params: {
                Bucket,
                Key: key,
                ACL,
                Body: storageKey === cloud_enum_1.MulterStorageEnum.MemoryStorage
                    ? file.buffer
                    : (0, node_fs_1.createReadStream)(file.path),
                ContentType: contentType,
            },
            partSize: partSize * 1024 * 1024,
        });
        result.on("httpUploadProgress", (progress) => {
            console.log(chalk_1.default.green(`${(progress.loaded / progress.total) * 100}%`));
        });
        await result.done();
        return key;
    }
    async getFile({ Bucket = config_service_1.env.BUCKET_NAME, key, }) {
        const file = new client_s3_1.GetObjectCommand({
            Bucket,
            Key: key,
        }); // get file from AWS
        return await this.client.send(file); // Access file from AWS & send it to me
    }
    //  pre signed url to make the load on the client device instead of my server
    async createPreSignedUrl({ Bucket = config_service_1.env.BUCKET_NAME, path = "general", ContentType, Key, Expires = 60 * 2, Originalname, }) {
        const key = `${path}/${(0, node_crypto_1.randomUUID)()}-${Originalname}`;
        const result = new client_s3_1.PutObjectCommand({
            Bucket,
            Key: key,
            ContentType,
        });
        const url = await (0, s3_request_presigner_1.getSignedUrl)(this.client, result, { expiresIn: Expires });
        return { url, key };
    }
    async createGetPreSignedUrl({ Bucket = config_service_1.env.BUCKET_NAME, Key, Expires = 60 * 5, }) {
        const command = new client_s3_1.GetObjectCommand({
            Bucket,
            Key,
            ResponseContentDisposition: "inline", // inline علشان المتصفح يقدر يعرض الصورة أو الفيديو بدل ما يطلب تحميله مباشرة
        });
        const url = await (0, s3_request_presigner_1.getSignedUrl)(this.client, command, {
            expiresIn: Expires,
        });
        return url;
    }
    async deleteFile({ Bucket = config_service_1.env.BUCKET_NAME, key, }) {
        const result = new client_s3_1.DeleteObjectCommand({
            Bucket,
            Key: key,
        });
        return await this.client.send(result);
    }
}
exports.S3Service = S3Service;
exports.default = new S3Service();
