import mongoose, { HydratedDocument, Model, Schema, Types } from "mongoose";
import { gradeEnum, gradeValues } from "../../Utils/enums/exam.enum";
import { IExam } from "./exam.model";

export interface IExamResult {
  _id: Types.ObjectId;
  student: Types.ObjectId;
  exam: Types.ObjectId | IExam;
  grade: gradeEnum;
  startedAt: Date;
  score?: number;
  wrongAns?: {
    questionId: Types.ObjectId;
    answer: number;
  }[];
}

const examResultSchema = new Schema<IExamResult>(
  {
    student: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },
    exam: {
      type: Types.ObjectId,
      ref: "Exam",
      required: true,
    },
    grade: {
      type: Number,
      enum: gradeValues,
    },
    startedAt: {
      type: Date,
      required: true,
    },
    score: Number,
    wrongAns: [
      {
        questionId: {
          type: Types.ObjectId,
        },
        answer: {
          type: Number,
          min: 0,
          max: 3,
        },
      },
    ],
  },
  { timestamps: true },
);

examResultSchema.index({ student: 1, exam: 1 }, { unique: true });
examResultSchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: Number(60 * 60 * 24 * 3) }, // 3 days
);

export const examResultModel: Model<IExamResult> =
  mongoose.models.ExamResult || mongoose.model("ExamResult", examResultSchema);

export type HExamResultDocument = HydratedDocument<IExamResult>;
