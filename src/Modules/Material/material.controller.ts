import { Router } from "express";
import { fileValidation, uploadFile } from "../../Utils/multer/cloud.multer";
import materialService from "./material.service";
import { MulterStorageEnum } from "../../Utils/enums/multer/cloud.enum";
import { validation } from "../../Middlewares/validation.middleware";
import * as validators from "./material.validation";

const router = Router();

router.post(
  "/",
  uploadFile({
    storageKey: MulterStorageEnum.DiskStorage,
    validation: [
      ...fileValidation.image,
      ...fileValidation.document,
      ...fileValidation.video,
    ],
    maxSizeMB: 20,
  }).single("file"),
  validation(validators.createMaterialBodySchema),
  materialService.createMaterial,
);

export default router;
