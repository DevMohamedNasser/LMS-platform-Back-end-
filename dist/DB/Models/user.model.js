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
exports.userModel = exports.userSchema = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const user_enum_1 = require("../../Utils/enums/user.enum");
const exam_enum_1 = require("../../Utils/enums/exam.enum");
exports.userSchema = new mongoose_1.Schema({
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
        enum: [user_enum_1.ProviderEnum.System, user_enum_1.ProviderEnum.Google],
        default: user_enum_1.ProviderEnum.System,
    },
    confirmEmailOTP: String,
    confirmEmailOTPExp: Date,
    confirmedAt: Date,
    password: {
        type: String,
        required: function () {
            return this.provider == user_enum_1.ProviderEnum.System;
        },
    },
    resetPasswordOTP: String,
    forgetPasswordOTP: String,
    forgetPasswordOTPExp: Date,
    address: String,
    grade: {
        type: Number,
        enum: exam_enum_1.gradeValues,
    },
    role: {
        type: String,
        enum: Object.values(user_enum_1.RoleEnum),
        default: user_enum_1.RoleEnum.USER,
    },
    phone: String,
    profilePic: String,
    // Firebase Notifications
    deviceTokens: [{ type: String }],
    notificationEnabled: { type: Boolean, default: true },
}, {
    timestamps: true,
    toObject: { virtuals: true },
    toJSON: {
        transform(doc, ret) {
            delete ret.password;
            delete ret.confirmEmailOTP;
            delete ret.resetPasswordOTP;
            return ret;
        },
    },
});
exports.userSchema
    .virtual("username")
    .set(function (value) {
    const [firstName, ...rest] = value.trim().split(/\s+/);
    this.set({ firstName, lastName: rest.join(" ") });
})
    .get(function () {
    return `${this.firstName} ${this.lastName}`;
});
exports.userModel = mongoose_1.default.models.User || mongoose_1.default.model("User", exports.userSchema);
