import { Router } from "express";
import materialService from "./material.service";
import { validation } from "../../Middlewares/validation.middleware";
import * as validators from "./material.validation";
import {
  authentication,
  authorization,
  TokenTypeEnum,
} from "../../Middlewares/authentication.middleware";
import { RoleEnum } from "../../Utils/enums/user.enum";
// import { fileValidation, uploadFile } from "../../Utils/multer/cloud.multer";
// import { MulterStorageEnum } from "../../Utils/enums/multer/cloud.enum";

const router = Router();
/** Upload through Front-end client to AWS S3 (Use it when server is heavy/weak) */
// router.post(
//   "/",
//   authentication({ tokenType: TokenTypeEnum.access }),
//   authorization({ accessRoles: [RoleEnum.ADMIN] }),
//   uploadFile({
//     storageKey: MulterStorageEnum.DiskStorage,
//     validation: [
//       ...fileValidation.image,
//       ...fileValidation.document,
//       ...fileValidation.video,
//     ],
//     maxSizeMB: 20,
//   }).single("file"),
//   validation(validators.createMaterialBodySchema),
//   materialService.createMaterial,
// );

/** Upload through Front-end client to AWS S3 (Use it when server is heavy/weak) */
router.post(
  "/",
  validation(validators.createMaterialBodySchema),
  authentication({ tokenType: TokenTypeEnum.access }),
  authorization({ accessRoles: [RoleEnum.ADMIN] }),
  materialService.createMaterial,
);

router.get(
  "/list-all",
  authentication({tokenType: TokenTypeEnum.access}),
  materialService.listAllMaterials
)

router.get(
  "/:id",
  validation(validators.mongoIdSchema),
  authentication({ tokenType: TokenTypeEnum.access }),
  materialService.getMaterial,
);

router.delete(
  "/:id",
  validation(validators.mongoIdSchema),
  authentication({ tokenType: TokenTypeEnum.access }),
  authorization({ accessRoles: [RoleEnum.ADMIN] }),
  materialService.deleteMaterial,
);

export default router;
