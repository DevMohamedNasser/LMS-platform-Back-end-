import mongoose, { HydratedDocument, Model, Schema, Types } from "mongoose";
import { gradeEnum } from "../../Utils/enums/exam.enum";

interface IMaterial {
  _id: Types.ObjectId;
  title: string;
  content: string;
  grade: gradeEnum;
  material: string[];
}

const materialSchema = new Schema<IMaterial>(
  {
    title: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    grade: {
      type: Number,
      enum: Object.values(gradeEnum),
      required: true,
    },
    material: [String],
  },
  { timestamps: true },
);

materialSchema.index({ title: 1, grade: -1 });

export const materialModel: Model<IMaterial> =
  mongoose.models.Material || mongoose.model("Material", materialSchema);

export type HMaterialDocument = HydratedDocument<IMaterial>;
