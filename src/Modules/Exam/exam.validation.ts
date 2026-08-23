import { z } from "zod";
import { gradeEnum } from "../../Utils/enums/exam.enum";

export const createQuestionSchema = {
  body: z.strictObject({
    question: z.string().min(5),
    options: z.array(z.string().min(1)).min(2).max(4),
    correctAns: z.string().regex(/^[a-dA-D]$/, {
      error: "Correct answer must be a, b, c or d",
    }),
  }),
};

export const CreateExamBodySchema = {
  body: z.strictObject({
    title: z.string().min(3),
    grade: z.enum(gradeEnum),
    duration: z.number().int().default(30),
    questions: z.array(createQuestionSchema.body).min(1),
  }),
};

export const examParamsIdSchema = {
  params: z.strictObject({
    id: z.string().regex(/^\w{24}$/, { error: "Invalid exam id" }),
  }),
};

export const submitExamBodySchema = {
  body: z.strictObject({
    answers: z.array(
      z.strictObject({
        questionId: z
          .string()
          .regex(/^\w{24}$/, { error: "Invalid question id" }),
        answer: z.string().regex(/^\w{24}$/, { error: "Invalid answer id" }),
      }),
    ),
  }),
};
