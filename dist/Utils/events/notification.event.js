"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationEvent = void 0;
const node_events_1 = require("node:events");
const push_service_1 = require("../firebase/push.service");
const notification_model_1 = require("../../DB/Models/notification.model");
exports.notificationEvent = new node_events_1.EventEmitter();
exports.notificationEvent.on("newExam", async (data) => {
    await (0, push_service_1.sendNotifications)({
        grade: data.grade,
        type: notification_model_1.NotificationTypeEnum.NewExam,
        title: notification_model_1.NotificationTypeEnum.NewExam,
        body: `Exam available for only 2 days`,
    });
});
exports.notificationEvent.on("newMaterial", async (data) => {
    await (0, push_service_1.sendNotifications)({
        grade: data.grade,
        type: notification_model_1.NotificationTypeEnum.NewMaterial,
        title: notification_model_1.NotificationTypeEnum.NewMaterial,
        body: `Watch now`,
    });
});
exports.notificationEvent.on("newMessage", async (data) => {
    await (0, push_service_1.sendNotifications)({
        grade: data.grade,
        type: notification_model_1.NotificationTypeEnum.NewMessage,
        title: notification_model_1.NotificationTypeEnum.NewMessage,
        body: data.message,
    });
});
