"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.stopTypingSchema = exports.typingSchema = exports.getMessagesSchema = exports.sendMessageSchema = void 0;
const zod_1 = require("zod");
const grade = zod_1.z.number().int().optional();
exports.sendMessageSchema = zod_1.z.object({
    grade, // الطالب بيتجاهله، المدرس/الأدمن لازم يبعته
    content: zod_1.z.string().trim().min(1, "content is required").max(10000),
});
exports.getMessagesSchema = zod_1.z.object({
    grade,
    before: zod_1.z.coerce.date().optional(), // cursor للـ pagination
    limit: zod_1.z.number().int().min(1).max(100).default(30),
});
exports.typingSchema = zod_1.z.object({ grade });
exports.stopTypingSchema = zod_1.z.object({ grade });
