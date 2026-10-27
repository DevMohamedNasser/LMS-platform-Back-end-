import mongoose, { HydratedDocument, Model, Schema, Types } from "mongoose";

export enum NotificationTypeEnum {
  NewExam = "New Exam",
  NewMaterial = "New Material",
  NewMessage = "New Message",
}

export interface INotification {
  _id: Types.ObjectId;
  userId: Types.ObjectId; // receiver

  type: NotificationTypeEnum;
  title: string;
  body: string;

  readAt?: Date;
  createdAt: Date;
  updatedAt?: Date;
}

/** I stopped storing notification for each user to save space in DB */
// export const notificationSchema = new Schema<INotification>(
//   {
//     userId: {
//       type: Types.ObjectId,
//       ref: "User",
//       required: true,
//     },

//     type: {
//       type: String,
//       enum: Object.values(NotificationTypeEnum),
//       required: true,
//     },
//     title: {
//       type: String,
//       required: true,
//     },
//     body: {
//       type: String,
//       required: true,
//     },

//     readAt: Date,
//   },
//   { timestamps: true },
// );

// // Compound Index
// notificationSchema.index({ userId: 1, createdAt: -1 });
// notificationSchema.index({ userId: 1, readAt: 1 });

// // TTL (Time To Live)
// notificationSchema.index(
//   { createdAt: 1 },
//   { expireAfterSeconds: 60 * 60 * 24 * 15 },
// ); // 15 Days

// export const notificationModel: Model<INotification> =
//   mongoose.models.Notification ||
//   mongoose.model("Notification", notificationSchema);

// export type HNotificationDocument = HydratedDocument<INotification>;
