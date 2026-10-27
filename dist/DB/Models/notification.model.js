"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationTypeEnum = void 0;
var NotificationTypeEnum;
(function (NotificationTypeEnum) {
    NotificationTypeEnum["NewExam"] = "New Exam";
    NotificationTypeEnum["NewMaterial"] = "New Material";
    NotificationTypeEnum["NewMessage"] = "New Message";
})(NotificationTypeEnum || (exports.NotificationTypeEnum = NotificationTypeEnum = {}));
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
