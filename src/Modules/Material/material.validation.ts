import * as z from "zod";
import { gradeEnum } from "../../Utils/enums/exam.enum";

export const createMaterialBodySchema = {
  body: z.strictObject({
    title: z.string().min(2),
    content: z.string().optional(),
    grade: z.coerce.number().int().pipe(z.enum(gradeEnum)),
  }),
};

export const mongoIdSchema = {
  params: z.strictObject({
    id: z.string().regex(/^\w{24}$/, { error: "Invalid ID format" }),
  }),
};
