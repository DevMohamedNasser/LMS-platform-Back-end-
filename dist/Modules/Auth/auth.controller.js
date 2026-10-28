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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const authentication_middleware_1 = require("../../Middlewares/authentication.middleware");
const validation_middleware_1 = require("../../Middlewares/validation.middleware");
const user_enum_1 = require("../../Utils/enums/user.enum");
const auth_service_1 = __importDefault(require("./auth.service"));
const authValidation = __importStar(require("./auth.validation"));
const express_1 = require("express");
const router = (0, express_1.Router)();
router.post("/signup", (0, validation_middleware_1.validation)(authValidation.signupSchema), auth_service_1.default.signup);
router.patch("/confirm-email", (0, validation_middleware_1.validation)(authValidation.confirmEmailSchema), auth_service_1.default.confirmEmail);
router.patch("/resend-otp", (0, validation_middleware_1.validation)(authValidation.resendOTPSchema), auth_service_1.default.resendOTP);
router.post("/login", (0, validation_middleware_1.validation)(authValidation.loginSchema), auth_service_1.default.login);
router.patch("/forget-password", (0, validation_middleware_1.validation)(authValidation.forgetPasswordSchema), auth_service_1.default.forgetPassword);
router.patch("/reset-password", (0, validation_middleware_1.validation)(authValidation.resetPasswordSchema), auth_service_1.default.resetPassword);
router.patch("/change-password", (0, validation_middleware_1.validation)(authValidation.changePasswordSchema), auth_service_1.default.changePassword);
router.post("/social-login", (0, validation_middleware_1.validation)(authValidation.googleOAuthSchema), auth_service_1.default.googleLogin);
router.post("/refresh-token", (0, authentication_middleware_1.authentication)({ tokenType: authentication_middleware_1.TokenTypeEnum.refresh }), (0, authentication_middleware_1.authorization)({ accessRoles: [user_enum_1.RoleEnum.ADMIN, user_enum_1.RoleEnum.USER] }), auth_service_1.default.refreshToken);
router.patch("/role/:id", (0, validation_middleware_1.validation)(authValidation.changeUserRole), (0, authentication_middleware_1.authentication)({ tokenType: authentication_middleware_1.TokenTypeEnum.access }), (0, authentication_middleware_1.authorization)({ accessRoles: [user_enum_1.RoleEnum.ADMIN] }), auth_service_1.default.changeUserRole);
router.patch("/grade", (0, validation_middleware_1.validation)(authValidation.changeUserGrade), (0, authentication_middleware_1.authentication)({ tokenType: authentication_middleware_1.TokenTypeEnum.access }), auth_service_1.default.changeUserGrade);
router.delete("/soft/:id", (0, validation_middleware_1.validation)(authValidation.mongoId), (0, authentication_middleware_1.authentication)({ tokenType: authentication_middleware_1.TokenTypeEnum.access }), (0, authentication_middleware_1.authorization)({ accessRoles: [user_enum_1.RoleEnum.ADMIN] }), auth_service_1.default.softDeleteUser);
// Firebase notifications
router.post("/enable-notifications", (0, validation_middleware_1.validation)(authValidation.FCMToken), (0, authentication_middleware_1.authentication)({ tokenType: authentication_middleware_1.TokenTypeEnum.access }), auth_service_1.default.firebaseEnableNotifications);
exports.default = router;
