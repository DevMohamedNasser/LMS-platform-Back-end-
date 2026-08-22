"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.localFileUpload = exports.uploadDir = exports.fileValidation = void 0;
const multer_1 = __importDefault(require("multer"));
const node_fs_1 = require("node:fs");
const node_path_1 = require("node:path");
const error_response_1 = require("../response/error.response");
exports.fileValidation = {
    image: [
        "image/avif",
        "image/gif",
        "image/jpeg",
        "image/jpeg",
        "image/webp",
        "image/png",
    ],
    document: ["application/pdf", "application/msword"],
    video: ["video/mp4", "video/webm", "video/quicktime", "video/x-matroska"],
};
exports.uploadDir = (0, node_path_1.resolve)("./uploads");
const localFileUpload = ({ validation = exports.fileValidation.image, maxSizeMB = 5, folder = "general", }) => {
    const storage = multer_1.default.diskStorage({
        destination: (req, file, cb) => {
            const destPath = (0, node_path_1.resolve)(`./uploads/${folder}`);
            if (!(0, node_fs_1.existsSync)(destPath)) {
                (0, node_fs_1.mkdirSync)(destPath, { recursive: true });
            }
            cb(null, destPath);
        },
        filename: (req, file, cb) => {
            const uniqueSuffix = Date.now() +
                "-" +
                Math.round(Math.random() * 1e9) +
                "-" +
                file.originalname;
            cb(null, file.fieldname + "-" + uniqueSuffix);
        },
    });
    const fileFilter = (req, file, cb) => {
        if (!validation.includes(file.mimetype)) {
            return cb(new error_response_1.BadRequestException(`Invalid file format: ${file.mimetype}`));
        }
        cb(null, true);
    };
    return (0, multer_1.default)({
        storage,
        fileFilter,
        limits: { fieldSize: maxSizeMB * 1024 * 1024 },
    });
};
exports.localFileUpload = localFileUpload;
