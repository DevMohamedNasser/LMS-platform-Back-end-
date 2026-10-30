import { z } from "zod";

const grade = z.number().int().optional();

export const sendMessageSchema = z.object({
  grade, // الطالب بيتجاهله، المدرس/الأدمن لازم يبعته
  content: z.string().trim().min(1, "content is required").max(10000),
});

export const getMessagesSchema = z.object({
  grade,
  before: z.coerce.date().optional(), // cursor للـ pagination
  limit: z.number().int().min(1).max(100).default(30),
});

export const typingSchema = z.object({ grade });

export const stopTypingSchema = z.object({ grade });
