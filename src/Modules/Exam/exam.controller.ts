import { Router } from "express";
import {
  authentication,
  authorization,
  TokenTypeEnum,
} from "../../Middlewares/authentication.middleware";
import examService from "./exam.service";
import * as validators from "./exam.validation";
import { validation } from "../../Middlewares/validation.middleware";
import { RoleEnum } from "../../Utils/enums/user.enum";

const router = Router();
router.use(authentication({ tokenType: TokenTypeEnum.access }));

router.post(
  "/",
  validation(validators.CreateExamBodySchema),
  authorization({ accessRoles: [RoleEnum.ADMIN] }),
  examService.createExam,
);

router.get("/list-exams", examService.listExams);

router.get(
  "/:id",
  validation(validators.examParamsIdSchema),
  examService.getExam,
);

router.post(
  "/submit/:id",
  validation(validators.examParamsIdSchema),
  validation(validators.submitExamBodySchema),
  examService.submitExam,
);

export default router;
