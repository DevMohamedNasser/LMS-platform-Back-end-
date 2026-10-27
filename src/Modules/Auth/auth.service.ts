import { OAuth2Client } from "google-auth-library";
import { Request, Response } from "express";
import {
  IChangePasswordDTO,
  IConfirmEmailDTO,
  IForgetPasswordDTO,
  IGoogleOAuthDTO,
  ILoginDTO,
  IResendOTPDTO,
  IResetPasswordDTO,
  ISignupDTO,
} from "./auth.dto";
import { userModel } from "../../DB/Models/user.model";
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
  UnauthorizedException,
} from "../../Utils/response/error.response";
import generateOTP from "../../Utils/email/generateOTP";
import { compareHash, generateHash } from "../../Utils/Security/hash.security";
import { emailEvent } from "../../Utils/events/email.event";
import { getNewLoginCredentials } from "../../Utils/Security/tokens.security";
import { env } from "../../Config/config.service";
import { IPayloadGoogleOAuth } from "../../Utils/SocialLogin.interface";
import { ProviderEnum } from "../../Utils/enums/user.enum";
import { Encrypt } from "../../Utils/Security/encryption.security";

class AuthService {
  constructor() {}

  signup = async (req: Request, res: Response): Promise<Response> => {
    const { email, password, username, phone, grade }: ISignupDTO = req.body;

    const isExist = await userModel.findOne({ email }).select("email");
    if (isExist) throw new ConflictException("User already exists");

    const otp = generateOTP();

    const encryptedPhone = phone ? Encrypt(phone) : undefined;

    const user = await userModel.create(
      [
        {
          username,
          email,
          password: await generateHash(password),
          confirmEmailOTP: await generateHash(otp),
          confirmEmailOTPExp: Date.now() + 1 * 1000 * 60,
          ...(grade && { grade }),
          ...(encryptedPhone && { phone: encryptedPhone }),
        },
      ],
      {
        validateBeforeSave: true,
      },
    );

    emailEvent.emit("confirmEmail", { to: email, username, otp });

    return res.status(201).json({ message: "Done, Plz verify ur email", user });
  };

  confirmEmail = async (req: Request, res: Response): Promise<Response> => {
    const { email, otp }: IConfirmEmailDTO = req.body;

    const user = await userModel.findOne({ email });
    if (!user) throw new NotFoundException(`User not found!!!`);

    if (!user.confirmEmailOTP)
      throw new BadRequestException(
        `Account already verified | something went wrong`,
      );

    if (new Date() > user.confirmEmailOTPExp)
      throw new BadRequestException(`OTP has been expired`);

    if (!(await compareHash(otp, user.confirmEmailOTP)))
      throw new BadRequestException(`Invalid OTP`);

    await userModel.updateOne(
      { email },
      {
        confirmedAt: Date.now(),
        $unset: { confirmEmailOTP: true, confirmEmailOTPExp: true },
        $inc: { __v: 1 },
      },
    );

    return res.status(200).json({ message: "User confirmed successfully" });
  };

  login = async (req: Request, res: Response): Promise<Response> => {
    const { email, password }: ILoginDTO = req.body;

    // const user = await userModel.findOne({
    //   email,
    //   confirmedAt: { $exists: true },
    // });
    const user = await userModel.findOne({ email });
    if (!user) throw new NotFoundException(`User not found, plz signup`);
    if (!user.confirmedAt)
      throw new BadRequestException("Plz verify ur email first");

    if (!(await compareHash(password, user.password)))
      throw new UnauthorizedException(`Incorrect email or password`);

    const tokens = getNewLoginCredentials(user);

    return res.status(200).json({ message: "Logged in successfully", tokens });
  };

  resendOTP = async (req: Request, res: Response): Promise<Response> => {
    const { email }: IResendOTPDTO = req.body;

    const user = await userModel.findOne({ email });
    if (!user) throw new NotFoundException("User not found! Plz signup");

    if (user.confirmedAt)
      throw new BadRequestException("Account already verified");

    if (Date.now() < user.confirmEmailOTPExp.getTime() - 3 * 1000 * 60)
      throw new BadRequestException("Can't send OTP before 2min of creation");

    const otp = generateOTP();
    user.confirmEmailOTP = await generateHash(otp);
    user.confirmEmailOTPExp = new Date(Date.now() + 5 * 1000 * 60);
    await user.save();

    emailEvent.emit("confirmEmail", {
      to: email,
      otp,
      username: user.username,
    });

    return res.status(200).json({ message: "Check ur inbox" });
  };

  forgetPassword = async (req: Request, res: Response): Promise<Response> => {
    const { email }: IForgetPasswordDTO = req.body;

    const user = await userModel.findOne({
      email,
      confirmedAt: { $exists: true },
    });
    if (!user)
      throw new NotFoundException("User not found | email not confirmed yet");

    if (
      user.forgetPasswordOTPExp &&
      Date.now() < user.forgetPasswordOTPExp.getTime() - 4 * 1000 * 60
    )
      throw new BadRequestException("Can't resend OTP before 1min of creation");

    const otp = generateOTP();

    user.forgetPasswordOTP = await generateHash(otp);
    user.forgetPasswordOTPExp = new Date(Date.now() + 5 * 1000 * 60);
    await user.save();

    emailEvent.emit("forgetPassword", {
      username: user.username,
      otp,
      to: email,
    });

    return res.status(200).json({ message: "Check ur inbox" });
  };

  resetPassword = async (req: Request, res: Response): Promise<Response> => {
    const { email, otp, newPassword }: IResetPasswordDTO = req.body;

    const user = await userModel.findOne({
      email,
    });
    if (!user) throw new NotFoundException("User not found");
    if (
      Date.now() > user.forgetPasswordOTPExp.getTime() ||
      !user.forgetPasswordOTP
    )
      throw new BadRequestException("OTP has been expired");
    if (!(await compareHash(otp, user.forgetPasswordOTP)))
      throw new BadRequestException("Invalid OTP");

    const hashedPassword = await generateHash(newPassword);

    await userModel.updateOne(
      { email },
      {
        $inc: { __v: 1 },
        $unset: { forgetPasswordOTP: true, forgetPasswordOTPExp: true },
        password: hashedPassword,
      },
    );

    return res.status(200).json({ message: "done" });
  };

  changePassword = async (req: Request, res: Response): Promise<Response> => {
    const { email, password, newPassword }: IChangePasswordDTO = req.body;

    const user = await userModel.findOne({ email });
    if (!user) throw new NotFoundException("User not found");

    const isMatchPassword = await compareHash(password, user.password);
    if (!isMatchPassword) throw new BadRequestException("Invalid old password");

    const newPasswordHashed = await generateHash(newPassword);

    user.password = newPasswordHashed;
    await user.save();

    return res.status(200).json({ message: "done" });
  };

  verifyGoogleAcc = async (idToken: string) => {
    const client = new OAuth2Client();
    const ticket = await client.verifyIdToken({
      idToken,
      audience: env.CLIENT_ID,
    });
    const payload = ticket.getPayload();
    if (!payload)
      throw new BadRequestException("Payload isn't defined, plz try later");
    return payload;
  };

  googleLogin = async (req: Request, res: Response): Promise<Response> => {
    const { idToken }: IGoogleOAuthDTO = req.body;

    const {
      email,
      email_verified,
      name: username,
      picture,
    }: IPayloadGoogleOAuth = await this.verifyGoogleAcc(idToken);

    if (!email_verified || !email || !username)
      throw new BadRequestException("Email not verified");

    if (!email_verified) throw new BadRequestException("Email not verified");

    let user = await userModel.findOne({ email });
    if (!user) {
      user = await userModel.create({
        confirmedAt: new Date(),
        email,
        username,
        profilePic: picture ?? "",
        provider: ProviderEnum.Google,
      });
    }

    const tokens = getNewLoginCredentials(user);

    return res
      .status(201)
      .json({ message: "Signup & Login successfully", tokens });
  };

  refreshToken = async (req: Request, res: Response): Promise<Response> => {
    const tokens = getNewLoginCredentials(req.user!);

    return res.status(200).json({ message: "done", tokens });
  };

  firebaseEnableNotifications = async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    const { deviceToken } = req.body;

    const user = await userModel.findByIdAndUpdate(
      req.user!._id,
      {
        $addToSet: { deviceTokens: deviceToken },
        notificationEnabled: true,
      },
      { returnDocument: "after" },
    );

    return res
      .status(200)
      .json({ message: "Notifications enabled successfully", user });
  };
}

export default new AuthService();
