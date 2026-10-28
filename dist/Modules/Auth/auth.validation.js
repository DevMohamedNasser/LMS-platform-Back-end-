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
exports.mongoId = exports.changeUserGrade = exports.changeUserRole = exports.FCMToken = exports.signupSchema = exports.googleOAuthSchema = exports.changePasswordSchema = exports.confirmEmailSchema = exports.resetPasswordSchema = exports.forgetPasswordSchema = exports.resendOTPSchema = exports.loginSchema = void 0;
const z = __importStar(require("zod"));
const user_enum_1 = require("../../Utils/enums/user.enum");
const exam_enum_1 = require("../../Utils/enums/exam.enum");
exports.loginSchema = {
    body: z.strictObject({
        email: z.email(),
        password: z
            .string({ error: "password is required" })
            .min(6, { error: "password must be at least 6 chars long" }),
    }),
};
exports.resendOTPSchema = {
    body: z.object({
        email: z.email(),
    }),
};
exports.forgetPasswordSchema = {
    body: z.object({
        email: z.email(),
    }),
};
exports.resetPasswordSchema = {
    body: z.object({
        email: z.email(),
        otp: z.string().regex(/^\d{6}$/),
        newPassword: z
            .string()
            .min(6, { error: "password must be at least 6 chars long" }),
    }),
};
exports.confirmEmailSchema = {
    body: z.strictObject({
        email: z.email(),
        otp: z.string().regex(/^\d{6}$/),
    }),
};
exports.changePasswordSchema = {
    body: z
        .object({
        email: z.email(),
        password: z
            .string()
            .min(6, { error: "password must be at least 6 chars long" }),
        newPassword: z
            .string()
            .min(6, { error: "password must be at least 6 chars long" }),
        confirmPassword: z
            .string()
            .min(6, { error: "password must be at least 6 chars long" }),
    })
        .superRefine((data, ctx) => {
        if (data.confirmPassword !== data.newPassword) {
            ctx.addIssue({
                code: "custom",
                input: "confirmPassword",
                message: "confirmPassword mismatch",
            });
        }
    }),
};
exports.googleOAuthSchema = {
    body: z.object({
        idToken: z.string({ error: "idToken is required" }),
    }),
};
exports.signupSchema = {
    body: exports.loginSchema.body
        .extend({
        grade: z.enum(exam_enum_1.gradeEnum),
        username: z
            .string({ error: "username is required" })
            .min(2, { error: "username must be at least 2 chars long" })
            .max(50, { error: "username must be at most 50 chars long" }),
        confirmPassword: z
            .string({ error: "password is required" })
            .min(6, { error: "password must be at least 6 chars long" }),
        gender: z.enum(user_enum_1.GenderEnum).default(user_enum_1.GenderEnum.MALE),
        phone: z.string().regex(/^(?:0|\+20|020)1[0125][\d]{8}$/),
    })
        .superRefine((data, ctx) => {
        if (data.password !== data.confirmPassword) {
            ctx.addIssue({
                code: "custom",
                path: ["confirmPassword"],
                message: "password mismatch",
            });
        }
    }),
};
exports.FCMToken = {
    body: z.strictObject({
        deviceToken: z.string().trim().min(1, "Device token is required"),
    }),
};
exports.changeUserRole = {
    body: z.strictObject({
        role: z.enum(user_enum_1.RoleEnum),
    }),
};
exports.changeUserGrade = {
    body: z.object({
        grade: z.enum(exam_enum_1.gradeEnum),
    }),
};
exports.mongoId = {
    params: z.object({
        id: z.string().regex(/^\w{24}$/, { error: "Invalid question id" }),
    }),
};
