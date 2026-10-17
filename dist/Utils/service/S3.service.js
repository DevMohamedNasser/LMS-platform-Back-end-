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
}
exports.S3Service = S3Service;
exports.default = new S3Service();
