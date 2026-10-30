import mongoose, { HydratedDocument, Model, Schema, Types } from "mongoose";
import { gradeValues } from "../../Utils/enums/exam.enum";

export interface IConversation {
  _id: Types.ObjectId;

  grade: number;

  lastMessage?: string;
  lastMessageAt?: Date;
  lastMessageBy?: Types.ObjectId;

  createdAt: Date;
  updatedAt?: Date;
}

export const conversationSchema = new Schema<IConversation>(
  {
    grade: {
      type: Number,
      enum: gradeValues,
      required: true,
    },
    lastMessage: { type: String },
    lastMessageAt: { type: Date },
    lastMessageBy: { type: Types.ObjectId, ref: "User" },
  },
  { timestamps: true },
);

conversationSchema.index({ grade: 1 }, { unique: true });

export const conversationModel: Model<IConversation> =
  mongoose.models.Conversation ||
  mongoose.model("Conversation", conversationSchema);

export type HConversationDocument = HydratedDocument<IConversation>;
