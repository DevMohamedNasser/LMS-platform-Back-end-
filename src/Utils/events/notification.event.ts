import { Types } from "mongoose";
import { EventEmitter } from "node:events";
import { sendNotifications } from "../firebase/push.service";
import { NotificationTypeEnum } from "../../DB/Models/notification.model";

export const notificationEvent = new EventEmitter();

interface IActor {
  _id: Types.ObjectId;
  firstName: string;
  lastName: string;
}

notificationEvent.on("newExam", async (data: { grade: number }) => {
  await sendNotifications({
    grade: data.grade,
    type: NotificationTypeEnum.NewExam,
    title: NotificationTypeEnum.NewExam,
    body: `Exam available for only 2 days`,
  });
});

notificationEvent.on("newMaterial", async (data: { grade: number }) => {
  await sendNotifications({
    grade: data.grade,
    type: NotificationTypeEnum.NewMaterial,
    title: NotificationTypeEnum.NewMaterial,
    body: `Watch now`,
  });
});

notificationEvent.on(
  "newMessage",
  async (data: { grade: number; message: string }) => {
    await sendNotifications({
      grade: data.grade,
      type: NotificationTypeEnum.NewMessage,
      title: NotificationTypeEnum.NewMessage,
      body: data.message,
    });
  },
);
