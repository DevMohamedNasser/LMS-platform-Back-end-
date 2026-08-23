import mongoose, { HydratedDocument, Model, Schema, Types } from "mongoose";
import { gradeEnum, gradeValues } from "../../Utils/enums/exam.enum";

export interface IOption {
  _id: Types.ObjectId;
  text: string;
}
export interface IQuestion {
  _id: Types.ObjectId;
  question: string;
  options: IOption[];
  correctAns: Types.ObjectId;
}

export interface IExam {
  _id: Types.ObjectId;
  title: string;
  grade: gradeEnum;
  questions: IQuestion[];
  durationMin: number;
}

export const optionSchema = new Schema<IOption>(
  {
    text: {
      type: String,
      required: true,
    },
  },
  { timestamps: false },
);

export const questionSchema = new Schema<IQuestion>(
  {
    question: {
      type: String,
      required: true,
    },
    options: [
      {
        type: optionSchema,
        required: true,
      },
    ],
    correctAns: {
      type: Types.ObjectId,
      required: true,
    },
  },
  { timestamps: false },
);

export const examSchema = new Schema<IExam>(
  {
    title: {
      type: String,
      required: true,
    },
    grade: {
      type: Number,
      enum: gradeValues,
      required: true,
    },
    durationMin: {
      type: Number,
      default: 30,
    },
    questions: [questionSchema],
  },
  {
    timestamps: true,
  },
);

// Compound Index
examSchema.index({ title: 1, grade: -1 }, { unique: true });
examSchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: Number(60 * 60 * 24 * 3) },
);

export const examModel: Model<IExam> =
  mongoose.models.Exam || mongoose.model("Exam", examSchema);

export type HExamDocument = HydratedDocument<IExam>;
