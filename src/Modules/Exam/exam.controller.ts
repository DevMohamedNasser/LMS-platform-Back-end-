import { Router } from "express";
import {
  authentication,
  TokenTypeEnum,
} from "../../Middlewares/authentication.middleware";
import examService from "./exam.service";
import * as validators from "./exam.validation";
import { validation } from "../../Middlewares/validation.middleware";

const router = Router();
router.use(authentication({ tokenType: TokenTypeEnum.access }));

router.post(
  "/",
  validation(validators.CreateExamBodySchema),
  examService.createExam,
);

router.get(
  "/list-exams",
  examService.listExams
)

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
