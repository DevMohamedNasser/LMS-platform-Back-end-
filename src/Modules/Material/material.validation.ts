import * as z from "zod";
import { gradeEnum } from "../../Utils/enums/exam.enum";

export const createMaterialBodySchema = {
  body: z.strictObject({
    title: z.string().min(2),
    content: z.string(),
    grade: z.coerce.number().int().pipe(z.enum(gradeEnum)),
  }),
};
