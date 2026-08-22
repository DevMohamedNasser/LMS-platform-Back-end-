import { Router } from "express";
import {
  authentication,
  TokenTypeEnum,
} from "../../Middlewares/authentication.middleware";

const router = Router();
router.use(authentication({ tokenType: TokenTypeEnum.access }));

export default router;
