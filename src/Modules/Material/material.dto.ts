import { z } from "zod";
import { createMaterialBodySchema, mongoIdSchema } from "./material.validation";

export type ICreateMaterialDTO = z.infer<typeof createMaterialBodySchema.body>;
export type IMongoIdDTO = z.infer<typeof mongoIdSchema.params>;
