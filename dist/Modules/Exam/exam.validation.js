"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.submitExamBodySchema = exports.examParamsIdSchema = exports.CreateExamBodySchema = exports.createQuestionSchema = void 0;
const zod_1 = require("zod");
const exam_enum_1 = require("../../Utils/enums/exam.enum");
exports.createQuestionSchema = {
    body: zod_1.z.strictObject({
        question: zod_1.z.string().min(5),
        options: zod_1.z.array(zod_1.z.string().min(1)).min(2).max(4),
        correctAns: zod_1.z.string().regex(/^[a-dA-D]$/, {
            error: "Correct answer must be a, b, c or d",
        }),
    }),
};
exports.CreateExamBodySchema = {
    body: zod_1.z.strictObject({
        title: zod_1.z.string().min(3),
        grade: zod_1.z.enum(exam_enum_1.gradeEnum),
        duration: zod_1.z.number().int().default(30),
        questions: zod_1.z.array(exports.createQuestionSchema.body).min(1),
    }),
};
exports.examParamsIdSchema = {
    params: zod_1.z.strictObject({
        id: zod_1.z.string().regex(/^\w{24}$/, { error: "Invalid exam id" }),
    }),
};
exports.submitExamBodySchema = {
    body: zod_1.z.strictObject({
        answers: zod_1.z.array(zod_1.z.strictObject({
            questionId: zod_1.z
                .string()
                .regex(/^\w{24}$/, { error: "Invalid question id" }),
            answer: zod_1.z.number().int().min(0).max(3),
        })),
    }),
};
