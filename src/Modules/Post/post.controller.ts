import { Router } from "express";
import {
  authentication,
  TokenTypeEnum,
} from "../../Middlewares/authentication.middleware";
import {
  fileValidation,
  localFileUpload,
} from "../../Utils/multer/cloud.multer";
import { validation } from "../../Middlewares/validation.middleware";
import * as validators from "./post.validation";
import postService from "./post.service";

const router = Router();

router.use(authentication({ tokenType: TokenTypeEnum.access }));

// create post
router.post(
  "/",
  localFileUpload({ validation: fileValidation.image, folder: "posts" }).array(
    "attachments",
    20,
  ),
  validation(validators.createPostSchema),
  postService.createPost
);

export default router;
