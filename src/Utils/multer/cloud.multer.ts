import { Request } from "express";
import multer, { FileFilterCallback, StorageEngine } from "multer";
import { existsSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { BadRequestException } from "../response/error.response";

export const fileValidation = {
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

export const uploadDir = resolve("./uploads");

export const localFileUpload = ({
  validation = fileValidation.image,
  maxSizeMB = 5,
  folder = "general",
}: {
  validation: string[];
  maxSizeMB?: number;
  folder?: string;
}) => {
  const storage: StorageEngine = multer.diskStorage({
    destination: (req: Request, file, cb) => {
      const destPath = resolve(`./uploads/${folder}`);
      if (!existsSync(destPath)) {
        mkdirSync(destPath, { recursive: true });
      }
      cb(null, destPath);
    },
    filename: (req: Request, file, cb) => {
      const uniqueSuffix =
        Date.now() +
        "-" +
        Math.round(Math.random() * 1e9) +
        "-" +
        file.originalname;
      cb(null, file.fieldname + "-" + uniqueSuffix);
    },
  });

  const fileFilter = (
    req: Request,
    file: Express.Multer.File,
    cb: FileFilterCallback,
  ): void => {
    if (!validation.includes(file.mimetype)) {
      return cb(
        new BadRequestException(`Invalid file format: ${file.mimetype}`),
      );
    }
    cb(null, true);
  };

  return multer({
    storage,
    fileFilter,
    limits: { fieldSize: maxSizeMB * 1024 * 1024 },
  });
};
