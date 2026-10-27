import * as z from "zod";
import { GenderEnum } from "../../Utils/enums/user.enum";
import { gradeEnum } from "../../Utils/enums/exam.enum";

export const loginSchema = {
  body: z.strictObject({
    email: z.email(),
    password: z
      .string({ error: "password is required" })
      .min(6, { error: "password must be at least 6 chars long" }),
  }),
};

export const resendOTPSchema = {
  body: z.object({
    email: z.email(),
  }),
};

export const forgetPasswordSchema = {
  body: z.object({
    email: z.email(),
  }),
};

export const resetPasswordSchema = {
  body: z.object({
    email: z.email(),
    otp: z.string().regex(/^\d{6}$/),
    newPassword: z
      .string()
      .min(6, { error: "password must be at least 6 chars long" }),
  }),
};

export const confirmEmailSchema = {
  body: z.strictObject({
    email: z.email(),
    otp: z.string().regex(/^\d{6}$/),
  }),
};

export const changePasswordSchema = {
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

export const googleOAuthSchema = {
  body: z.object({
    idToken: z.string({ error: "idToken is required" }),
  }),
};

export const signupSchema = {
  body: loginSchema.body
    .extend({
      grade: z.enum(gradeEnum),
      username: z
        .string({ error: "username is required" })
        .min(2, { error: "username must be at least 2 chars long" })
        .max(50, { error: "username must be at most 50 chars long" }),

      confirmPassword: z
        .string({ error: "password is required" })
        .min(6, { error: "password must be at least 6 chars long" }),
      gender: z.enum(GenderEnum).default(GenderEnum.MALE),
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

export const FCMToken = {
  body: z.strictObject({
    deviceToken: z.string().trim().min(1, "Device token is required"),
  }),
};
