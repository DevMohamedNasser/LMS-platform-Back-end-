import {
  authentication,
  authorization,
  TokenTypeEnum,
} from "../../Middlewares/authentication.middleware";
import { validation } from "../../Middlewares/validation.middleware";
import { RoleEnum } from "../../Utils/enums/user.enum";
import authService from "./auth.service";
import * as authValidation from "./auth.validation";
import { Router } from "express";

const router = Router();

router.post(
  "/signup",
  validation(authValidation.signupSchema),
  authService.signup,
);
router.patch(
  "/confirm-email",
  validation(authValidation.confirmEmailSchema),
  authService.confirmEmail,
);
router.patch(
  "/resend-otp",
  validation(authValidation.resendOTPSchema),
  authService.resendOTP,
);
router.post(
  "/login",
  validation(authValidation.loginSchema),
  authService.login,
);
router.patch(
  "/forget-password",
  validation(authValidation.forgetPasswordSchema),
  authService.forgetPassword,
);
router.patch(
  "/reset-password",
  validation(authValidation.resetPasswordSchema),
  authService.resetPassword,
);
router.patch(
  "/change-password",
  validation(authValidation.changePasswordSchema),
  authService.changePassword,
);
router.post(
  "/social-login",
  validation(authValidation.googleOAuthSchema),
  authService.googleLogin,
);

router.post(
  "/refresh-token",
  authentication({ tokenType: TokenTypeEnum.refresh }),
  authorization({ accessRoles: [RoleEnum.ADMIN, RoleEnum.USER] }),
  authService.refreshToken,
);

// Firebase notifications
router.post(
  "/enable-notifications",
  validation(authValidation.FCMToken),
  authentication({ tokenType: TokenTypeEnum.access }),
  authService.firebaseEnableNotifications,
);

export default router;
