"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerChatEvents = exports.gradeRoom = void 0;
const conversation_model_1 = require("../../DB/Models/conversation.model");
const message_model_1 = require("../../DB/Models/message.model");
const user_enum_1 = require("../../Utils/enums/user.enum");
const exam_enum_1 = require("../../Utils/enums/exam.enum");
const error_response_1 = require("../response/error.response");
const socket_helper_1 = require("./socket.helper");
const validators = __importStar(require("../../Modules/Chat/chat.validation"));
const z = __importStar(require("zod"));
const gradeRoom = (grade) => `grade:${grade}`;
exports.gradeRoom = gradeRoom;
class ChatService {
    io;
    socket;
    constructor(io, socket) {
        this.io = io;
        this.socket = socket;
    }
    get isStaff() {
        const role = this.socket.user.role;
        return role === user_enum_1.RoleEnum.ADMIN;
    }
    /** بيحدد الجروب المسموح للمستخدم، ومش بيثق في الداتا اللي جاية من الكلاينت للطالب */
    resolveGrade(requested) {
        const user = this.socket.user;
        if (this.isStaff) {
            if (requested === undefined)
                throw new error_response_1.BadRequestException("grade is required");
            if (!exam_enum_1.gradeValues.includes(requested))
                throw new error_response_1.BadRequestException("Invalid grade");
            return requested;
        }
        if (user.grade === undefined)
            throw new error_response_1.ForbiddenException("Your grade is not set");
        if (requested !== undefined && requested !== user.grade)
            throw new error_response_1.ForbiddenException("You can only access your own grade group");
        return user.grade;
    }
    async getOrCreateConversation(grade) {
        return conversation_model_1.conversationModel.findOneAndUpdate({ grade }, { $setOnInsert: { grade } }, { upsert: true, returnDocument: "after" });
    }
    /** بيتنده عند الـ connection */
    joinRooms = () => {
        const user = this.socket.user;
        if (this.isStaff) {
            exam_enum_1.gradeValues.forEach((g) => this.socket.join((0, exports.gradeRoom)(g)));
        }
        else if (user.grade !== undefined) {
            this.socket.join((0, exports.gradeRoom)(user.grade));
        }
    };
    /** الجروبات المتاحة للمستخدم (آخر رسالة لكل جروب) */
    getGroups = async () => {
        const user = this.socket.user;
        if (!this.isStaff) {
            if (user.grade === undefined)
                throw new error_response_1.ForbiddenException("Your grade is not set");
            const group = await conversation_model_1.conversationModel
                .findOneAndUpdate({ grade: user.grade }, {
                $setOnInsert: {
                    grade: user.grade,
                },
            }, {
                upsert: true,
                returnDocument: "after",
            })
                .lean();
            this.socket.emit("groups", [group]);
            return;
        }
        // Admin: يرجع كل الجروبات الموجودة
        const groups = await conversation_model_1.conversationModel
            .find({})
            .sort({ lastMessageAt: -1 })
            .lean();
        this.socket.emit("groups", groups);
    };
    sendMessage = async (data) => {
        const user = this.socket.user;
        const grade = this.resolveGrade(data.grade);
        const conversation = await this.getOrCreateConversation(grade);
        const message = await message_model_1.messageModel.create({
            conversationId: conversation._id,
            senderId: user._id,
            content: data.content,
        });
        await conversation_model_1.conversationModel.updateOne({ _id: conversation._id }, {
            lastMessage: message.content.slice(0, 100),
            lastMessageAt: message.createdAt,
            lastMessageBy: user._id,
        });
        this.io.to((0, exports.gradeRoom)(grade)).emit("newMessage", {
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
    getMessages = async (data) => {
        const grade = this.resolveGrade(data.grade);
        const conversation = await conversation_model_1.conversationModel.findOne({ grade }).lean();
        if (!conversation) {
            this.socket.emit("messages", { grade, messages: [], hasMore: false });
            return;
        }
        const filter = {
            conversationId: conversation._id,
        };
        if (data.before)
            filter.createdAt = { $lt: data.before };
        const docs = await message_model_1.messageModel
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
    typing = async (data) => {
        const user = this.socket.user;
        const grade = this.resolveGrade(data.grade);
        this.socket.to((0, exports.gradeRoom)(grade)).emit("typing", {
            grade,
            userId: user._id,
            name: user.username,
        });
    };
    stopTyping = async (data) => {
        const user = this.socket.user;
        const grade = this.resolveGrade(data.grade);
        this.socket.to((0, exports.gradeRoom)(grade)).emit("stopTyping", {
            grade,
            userId: user._id,
            name: user.username,
        });
    };
}
/** بيتنده من socket.ts عند كل connection */
const registerChatEvents = (io, socket) => {
    const chat = new ChatService(io, socket);
    chat.joinRooms();
    socket.on("getGroups", (0, socket_helper_1.handleEvent)(socket, "getGroups", z.any(), chat.getGroups));
    socket.on("sendMessage", (0, socket_helper_1.handleEvent)(socket, "sendMessage", validators.sendMessageSchema, chat.sendMessage));
    socket.on("getMessages", (0, socket_helper_1.handleEvent)(socket, "getMessages", validators.getMessagesSchema, chat.getMessages));
    socket.on("typing", (0, socket_helper_1.handleEvent)(socket, "typing", validators.typingSchema, chat.typing));
    socket.on("stopTyping", (0, socket_helper_1.handleEvent)(socket, "stopTyping", validators.stopTypingSchema, chat.stopTyping));
};
exports.registerChatEvents = registerChatEvents;
