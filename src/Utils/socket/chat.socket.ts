import { Server } from "socket.io";
import { conversationModel } from "../../DB/Models/conversation.model";
import { messageModel } from "../../DB/Models/message.model";
import { RoleEnum } from "../../Utils/enums/user.enum";
import { gradeValues } from "../../Utils/enums/exam.enum";
import {
  BadRequestException,
  ForbiddenException,
} from "../response/error.response";
import { IAuthedSocket } from "./socket.service";
import { handleEvent } from "./socket.helper";
import * as validators from "../../Modules/Chat/chat.validation";
import * as z from "zod";
import {
  GetMessagesDto,
  SendMessageDto,
  StopTypingDto,
  TypingDto,
} from "../../Modules/Chat/chat.dto";

export const gradeRoom = (grade: number) => `grade:${grade}`;

class ChatService {
  constructor(
    private readonly io: Server,
    private readonly socket: IAuthedSocket,
  ) {}

  private get isStaff(): boolean {
    const role = this.socket.user!.role;
    return role === RoleEnum.ADMIN;
  }

  /** بيحدد الجروب المسموح للمستخدم، ومش بيثق في الداتا اللي جاية من الكلاينت للطالب */
  private resolveGrade(requested?: number): number {
    const user = this.socket.user!;

    if (this.isStaff) {
      if (requested === undefined)
        throw new BadRequestException("grade is required");
      if (!gradeValues.includes(requested))
        throw new BadRequestException("Invalid grade");
      return requested;
    }

    if (user.grade === undefined)
      throw new ForbiddenException("Your grade is not set");

    if (requested !== undefined && requested !== user.grade)
      throw new ForbiddenException("You can only access your own grade group");

    return user.grade;
  }

  private async getOrCreateConversation(grade: number) {
    return conversationModel.findOneAndUpdate(
      { grade },
      { $setOnInsert: { grade } },
      { upsert: true, returnDocument: "after" },
    );
  }

  /** بيتنده عند الـ connection */
  joinRooms = (): void => {
    const user = this.socket.user!;
    if (this.isStaff) {
      gradeValues.forEach((g) => this.socket.join(gradeRoom(g as number)));
    } else if (user.grade !== undefined) {
      this.socket.join(gradeRoom(user.grade));
    }
  };

  /** الجروبات المتاحة للمستخدم (آخر رسالة لكل جروب) */
  getGroups = async (): Promise<void> => {
    const user = this.socket.user!;

    if (!this.isStaff) {
      if (user.grade === undefined)
        throw new ForbiddenException("Your grade is not set");

      const group = await conversationModel
        .findOneAndUpdate(
          { grade: user.grade },
          {
            $setOnInsert: {
              grade: user.grade,
            },
          },
          {
            upsert: true,
            returnDocument: "after",
          },
        )
        .lean();

      this.socket.emit("groups", [group]);
      return;
    }

    // Admin: يرجع كل الجروبات الموجودة
    const groups = await conversationModel
      .find({})
      .sort({ lastMessageAt: -1 })
      .lean();

    this.socket.emit("groups", groups);
  };

  sendMessage = async (data: SendMessageDto): Promise<void> => {
    const user = this.socket.user!;
    const grade = this.resolveGrade(data.grade);
    const conversation = await this.getOrCreateConversation(grade);

    const message = await messageModel.create({
      conversationId: conversation._id,
      senderId: user._id,
      content: data.content,
    });

    await conversationModel.updateOne(
      { _id: conversation._id },
      {
        lastMessage: message.content.slice(0, 100),
        lastMessageAt: message.createdAt,
        lastMessageBy: user._id,
      },
    );

    this.io.to(gradeRoom(grade)).emit("newMessage", {
      _id: message._id,
      grade,
      conversationId: conversation._id,
      content: message.content,
      createdAt: message.createdAt,
      sender: {
        _id: user._id,
        name: user.username,
        profilePic: user.profilePic,
        role: user.role,
      },
    });
  };

  getMessages = async (data: GetMessagesDto): Promise<void> => {
    const grade = this.resolveGrade(data.grade);
    const conversation = await conversationModel.findOne({ grade }).lean();

    if (!conversation) {
      this.socket.emit("messages", { grade, messages: [], hasMore: false });
      return;
    }

    const filter: Record<string, unknown> = {
      conversationId: conversation._id,
    };
    if (data.before) filter.createdAt = { $lt: data.before };

    const docs = await messageModel
      .find(filter)
      .sort({ createdAt: -1 })
      .limit(data.limit + 1)
      .populate("senderId", "firstName lastName profilePic role")
      .lean();

    const hasMore = docs.length > data.limit;
    this.socket.emit("messages", {
      grade,
      messages: docs.slice(0, data.limit),
      hasMore,
    });
  };

  typing = async (data: TypingDto): Promise<void> => {
    const user = this.socket.user!;
    const grade = this.resolveGrade(data.grade);
    this.socket.to(gradeRoom(grade)).emit("typing", {
      grade,
      userId: user._id,
      name: user.username,
    });
  };

  stopTyping = async (data: StopTypingDto): Promise<void> => {
    const user = this.socket.user!;
    const grade = this.resolveGrade(data.grade);

    this.socket.to(gradeRoom(grade)).emit("stopTyping", {
      grade,
      userId: user._id,
      name: user.username,
    });
  };
}

/** بيتنده من socket.ts عند كل connection */
export const registerChatEvents = (io: Server, socket: IAuthedSocket) => {
  const chat = new ChatService(io, socket);

  chat.joinRooms();

  socket.on(
    "getGroups",
    handleEvent(socket, "getGroups", z.any(), chat.getGroups),
  );

  socket.on(
    "sendMessage",
    handleEvent(
      socket,
      "sendMessage",
      validators.sendMessageSchema,
      chat.sendMessage,
    ),
  );

  socket.on(
    "getMessages",
    handleEvent(
      socket,
      "getMessages",
      validators.getMessagesSchema,
      chat.getMessages,
    ),
  );

  socket.on(
    "typing",
    handleEvent(socket, "typing", validators.typingSchema, chat.typing),
  );

  socket.on(
    "stopTyping",
    handleEvent(
      socket,
      "stopTyping",
      validators.stopTypingSchema,
      chat.stopTyping,
    ),
  );
};
