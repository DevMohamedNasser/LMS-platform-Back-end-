import mongoose, { HydratedDocument, Model, Schema, Types } from "mongoose";
import { ProviderEnum, RoleEnum } from "../../Utils/enums/user.enum";
import { gradeEnum, gradeValues } from "../../Utils/enums/exam.enum";

export interface IUser {
  _id: Types.ObjectId;
  firstName: string;
  lastName: string;
  username?: string;

  email: string;
  confirmEmailOTP?: string;
  confirmEmailOTPExp: Date;
  confirmedAt: Date;
  password: string;
  resetPasswordOTP?: string;
  forgetPasswordOTP?: string;
  forgetPasswordOTPExp: Date;

  phone?: string;
  address?: string;
  profilePic: string;
  provider: ProviderEnum;

  // gender: GenderEnum;
  grade: gradeEnum;
  role: RoleEnum;

  // FirebaseNotifications
  deviceTokens: string[];
  notificationEnabled: boolean;

  createdAt: Date;
  updatedAt?: Date;
}

export const userSchema = new Schema<IUser>(
  {
    firstName: {
      type: String,
      minLength: [2, "Must be at least 2 chars long"],
      maxLength: [25, "Must be at most 25 chars long"],
      required: [true, "firstName is required"],
    },
    lastName: {
      type: String,
      minLength: [2, "Must be at least 2 chars long"],
      maxLength: [25, "Must be at most 25 chars long"],
      required: [true, "lastName is required"],
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    provider: {
      type: Number,
      enum: [ProviderEnum.System, ProviderEnum.Google],
      default: ProviderEnum.System,
    },
    confirmEmailOTP: String,
    confirmEmailOTPExp: Date,
    confirmedAt: Date,
    password: {
      type: String,
      required: function (this) {
        return this.provider == ProviderEnum.System;
      },
    },
    resetPasswordOTP: String,
    forgetPasswordOTP: String,
    forgetPasswordOTPExp: Date,
    address: String,

    grade: {
      type: Number,
      enum: gradeValues,
    },

    role: {
      type: String,
      enum: Object.values(RoleEnum),
      default: RoleEnum.USER,
    },
    phone: String,
    profilePic: String,

    // Firebase Notifications
    deviceTokens: [{ type: String }],
    notificationEnabled: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    toObject: { virtuals: true },
    toJSON: {
      transform(doc, ret: Record<string, unknown>) {
        delete ret.password;
        delete ret.confirmEmailOTP;
        delete ret.resetPasswordOTP;
        return ret;
      },
    },
  },
);

userSchema
  .virtual("username")
  .set(function (value: string) {
    const [firstName, ...rest] = value.trim().split(/\s+/);
    this.set({ firstName, lastName: rest.join(" ") });
  })
  .get(function (this: IUser) {
    return `${this.firstName} ${this.lastName}`;
  });

export const userModel: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", userSchema);

export type HUserDocument = HydratedDocument<IUser>;
