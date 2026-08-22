import * as z from "zod";
import { CreateExamBodySchema, examParamsIdSchema, submitExamBodySchema } from "./exam.validation";

export type IExamDTO = z.infer<typeof CreateExamBodySchema.body>;
export type IExamParamsIdDTO = z.infer<typeof examParamsIdSchema.params>;
export type ISubmitExamBodyDTO = z.infer<typeof submitExamBodySchema.body>;
