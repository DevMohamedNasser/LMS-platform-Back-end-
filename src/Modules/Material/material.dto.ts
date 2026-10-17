import { z } from "zod";
import { createMaterialBodySchema } from "./material.validation";

export type ICreateMaterialDTO = z.infer<typeof createMaterialBodySchema.body>;
