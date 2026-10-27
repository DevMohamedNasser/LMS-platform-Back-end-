import { NotificationTypeEnum } from "../../DB/Models/notification.model";
import { userModel } from "../../DB/Models/user.model";
import chalk from "chalk";
import { getFirebaseMessaging } from "./firebase.config";

export interface INotificationPayload {
  grade: number;

  type: NotificationTypeEnum;
  title: string;
  body: string;
}

const buildData = (payload: INotificationPayload): Record<string, string> => {
  const data: Record<string, string> = {
    ...payload,
    grade: payload.grade.toString(),
    type: payload.type.toString(),
  };

  return data;
};

export const sendNotifications = async (
  payload: INotificationPayload,
): Promise<void> => {
  try {
    const recipients = await userModel
      .find({ grade: payload.grade, notificationEnabled: true })
      .select("deviceTokens notificationEnabled");
    if (!recipients) return;

    // Store notification in DB
    // await notificationModel.create({
    //   userId: payload.userId,
    //   type: payload.type,
    //   title: payload.title,
    //   body: payload.body,
    // });

    // if (!recipients.notificationEnabled) {
    //   console.log(chalk.red(`[push] skipped - user has notification disabled`));
    //   return;
    // }

    // const tokens = recipients.flatMap(
    //   (recipient) => recipient.deviceTokens ?? [],
    // );
    const tokens = [
      ...new Set(
        recipients.flatMap((recipient) => recipient.deviceTokens ?? []),
      ),
    ];
    if (tokens.length === 0) {
      console.log(chalk.red("[push] skipped - no registered device tokens"));
      return;
    }

    // const tokens = recipient.deviceTokens ?? [];
    // if (!tokens.length) {
    //   console.log(
    //     chalk.red("[push] skipped - user hasn't any registered devices"),
    //   );
    //   return;
    // }

    const messaging = getFirebaseMessaging();
    if (!messaging) {
      console.log(chalk.red("[push] skipped - firebase isn't initialized"));
      return;
    }

    const response = await messaging?.sendEachForMulticast({
      tokens,
      notification: { title: payload.title, body: payload.body },
      data: buildData(payload),
    });

    console.log(
      chalk.green(
        `[push] success: ${response?.successCount}, failure: ${response?.failureCount}`,
      ),
    );
  } catch (error) {
    console.log(
      chalk.red(
        `[push] failed to send notification, `,
        (error as Error).message,
      ),
    );
  }
};
