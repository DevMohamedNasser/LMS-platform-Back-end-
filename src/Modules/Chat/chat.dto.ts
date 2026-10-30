import { z } from "zod";
import * as validators from "./chat.validation";

export type SendMessageDto = z.infer<typeof validators.sendMessageSchema>;
export type GetMessagesDto = z.infer<typeof validators.getMessagesSchema>;
export type TypingDto = z.infer<typeof validators.typingSchema>;
export type StopTypingDto = z.infer<typeof validators.stopTypingSchema>;
