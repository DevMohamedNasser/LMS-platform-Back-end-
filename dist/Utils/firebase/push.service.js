"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendNotifications = void 0;
const user_model_1 = require("../../DB/Models/user.model");
const chalk_1 = __importDefault(require("chalk"));
const firebase_config_1 = require("./firebase.config");
const buildData = (payload) => {
    const data = {
        ...payload,
        grade: payload.grade.toString(),
        type: payload.type.toString(),
    };
    return data;
};
const sendNotifications = async (payload) => {
    try {
        const recipients = await user_model_1.userModel
            .find({ grade: payload.grade, notificationEnabled: true })
            .select("deviceTokens notificationEnabled");
        if (!recipients)
            return;
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
            ...new Set(recipients.flatMap((recipient) => recipient.deviceTokens ?? [])),
        ];
        if (tokens.length === 0) {
            console.log(chalk_1.default.red("[push] skipped - no registered device tokens"));
            return;
        }
        // const tokens = recipient.deviceTokens ?? [];
        // if (!tokens.length) {
        //   console.log(
        //     chalk.red("[push] skipped - user hasn't any registered devices"),
        //   );
        //   return;
        // }
        const messaging = (0, firebase_config_1.getFirebaseMessaging)();
        if (!messaging) {
            console.log(chalk_1.default.red("[push] skipped - firebase isn't initialized"));
            return;
        }
        const response = await messaging?.sendEachForMulticast({
            tokens,
            notification: { title: payload.title, body: payload.body },
            data: buildData(payload),
        });
        console.log(chalk_1.default.green(`[push] success: ${response?.successCount}, failure: ${response?.failureCount}`));
    }
    catch (error) {
        console.log(chalk_1.default.red(`[push] failed to send notification, `, error.message));
    }
};
exports.sendNotifications = sendNotifications;
