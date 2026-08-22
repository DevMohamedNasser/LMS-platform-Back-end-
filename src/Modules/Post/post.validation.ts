import { z } from "zod";

export const createPostSchema = {
  body: z.strictObject({
    content: z.string().min(2).max(50000).optional(),
  }),
};
