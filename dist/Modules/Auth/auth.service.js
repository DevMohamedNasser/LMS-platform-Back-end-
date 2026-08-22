"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const google_auth_library_1 = require("google-auth-library");
const user_model_1 = require("../../DB/Models/user.model");
const error_response_1 = require("../../Utils/response/error.response");
const generateOTP_1 = __importDefault(require("../../Utils/email/generateOTP"));
const hash_security_1 = require("../../Utils/Security/hash.security");
const email_event_1 = require("../../Utils/events/email.event");
const tokens_security_1 = require("../../Utils/Security/tokens.security");
const config_service_1 = require("../../Config/config.service");
const user_enum_1 = require("../../Utils/enums/user.enum");
const encryption_security_1 = require("../../Utils/Security/encryption.security");
class AuthService {
    constructor() { }
    signup = async (req, res) => {
        const { email, password, username, phone, grade } = req.body;
        const isExist = await user_model_1.userModel.findOne({ email }).select("email");
        if (isExist)
            throw new error_response_1.ConflictException("User already exists");
        const otp = (0, generateOTP_1.default)();
        const encryptedPhone = phone ? (0, encryption_security_1.Encrypt)(phone) : undefined;
        const user = await user_model_1.userModel.create([
            {
                username,
                email,
                password: await (0, hash_security_1.generateHash)(password),
                confirmEmailOTP: await (0, hash_security_1.generateHash)(otp),
                confirmEmailOTPExp: Date.now() + 1 * 1000 * 60,
                ...(grade && { grade }),
                ...(encryptedPhone && { phone: encryptedPhone })
            },
        ], {
            validateBeforeSave: true,
        });
        email_event_1.emailEvent.emit("confirmEmail", { to: email, username, otp });
        return res.status(201).json({ message: "Done, Plz verify ur email", user });
    };
    confirmEmail = async (req, res) => {
        const { email, otp } = req.body;
        const user = await user_model_1.userModel.findOne({ email });
        if (!user)
            throw new error_response_1.NotFoundException(`User not found!!!`);
        if (!user.confirmEmailOTP)
            throw new error_response_1.BadRequestException(`Account already verified | something went wrong`);
        if (new Date() > user.confirmEmailOTPExp)
            throw new error_response_1.BadRequestException(`OTP has been expired`);
        if (!(await (0, hash_security_1.compareHash)(otp, user.confirmEmailOTP)))
            throw new error_response_1.BadRequestException(`Invalid OTP`);
        await user_model_1.userModel.updateOne({ email }, {
            confirmedAt: Date.now(),
            $unset: { confirmEmailOTP: true, confirmEmailOTPExp: true },
            $inc: { __v: 1 },
        });
        return res.status(200).json({ message: "User confirmed successfully" });
    };
    login = async (req, res) => {
        const { email, password } = req.body;
        // const user = await userModel.findOne({
        //   email,
        //   confirmedAt: { $exists: true },
        // });
        const user = await user_model_1.userModel.findOne({ email });
        if (!user)
            throw new error_response_1.NotFoundException(`User not found, plz signup`);
        if (!user.confirmedAt)
            throw new error_response_1.BadRequestException("Plz verify ur email first");
        if (!(await (0, hash_security_1.compareHash)(password, user.password)))
            throw new error_response_1.UnauthorizedException(`Incorrect email or password`);
        const tokens = (0, tokens_security_1.getNewLoginCredentials)(user);
        return res.status(200).json({ message: "Logged in successfully", tokens });
    };
    resendOTP = async (req, res) => {
        const { email } = req.body;
        const user = await user_model_1.userModel.findOne({ email });
        if (!user)
            throw new error_response_1.NotFoundException("User not found! Plz signup");
        if (user.confirmedAt)
            throw new error_response_1.BadRequestException("Account already verified");
        if (Date.now() < user.confirmEmailOTPExp.getTime() - 3 * 1000 * 60)
            throw new error_response_1.BadRequestException("Can't send OTP before 2min of creation");
        const otp = (0, generateOTP_1.default)();
        user.confirmEmailOTP = await (0, hash_security_1.generateHash)(otp);
        user.confirmEmailOTPExp = new Date(Date.now() + 5 * 1000 * 60);
        await user.save();
        email_event_1.emailEvent.emit("confirmEmail", {
            to: email,
            otp,
            username: user.username,
        });
        return res.status(200).json({ message: "Check ur inbox" });
    };
    forgetPassword = async (req, res) => {
        const { email } = req.body;
        const user = await user_model_1.userModel.findOne({
            email,
            confirmedAt: { $exists: true },
        });
        if (!user)
            throw new error_response_1.NotFoundException("User not found | email not confirmed yet");
        if (user.forgetPasswordOTPExp &&
            Date.now() < user.forgetPasswordOTPExp.getTime() - 4 * 1000 * 60)
            throw new error_response_1.BadRequestException("Can't resend OTP before 1min of creation");
        const otp = (0, generateOTP_1.default)();
        user.forgetPasswordOTP = await (0, hash_security_1.generateHash)(otp);
        user.forgetPasswordOTPExp = new Date(Date.now() + 5 * 1000 * 60);
        await user.save();
        email_event_1.emailEvent.emit("forgetPassword", {
            username: user.username,
            otp,
            to: email,
        });
        return res.status(200).json({ message: "Check ur inbox" });
    };
    resetPassword = async (req, res) => {
        const { email, otp, newPassword } = req.body;
        const user = await user_model_1.userModel.findOne({
            email,
        });
        if (!user)
            throw new error_response_1.NotFoundException("User not found");
        if (Date.now() > user.forgetPasswordOTPExp.getTime() ||
            !user.forgetPasswordOTP)
            throw new error_response_1.BadRequestException("OTP has been expired");
        if (!(await (0, hash_security_1.compareHash)(otp, user.forgetPasswordOTP)))
            throw new error_response_1.BadRequestException("Invalid OTP");
        const hashedPassword = await (0, hash_security_1.generateHash)(newPassword);
        await user_model_1.userModel.updateOne({ email }, {
            $inc: { __v: 1 },
            $unset: { forgetPasswordOTP: true, forgetPasswordOTPExp: true },
            password: hashedPassword,
        });
        return res.status(200).json({ message: "done" });
    };
    changePassword = async (req, res) => {
        const { email, password, newPassword } = req.body;
        const user = await user_model_1.userModel.findOne({ email });
        if (!user)
            throw new error_response_1.NotFoundException("User not found");
        const isMatchPassword = await (0, hash_security_1.compareHash)(password, user.password);
        if (!isMatchPassword)
            throw new error_response_1.BadRequestException("Invalid old password");
        const newPasswordHashed = await (0, hash_security_1.generateHash)(newPassword);
        user.password = newPasswordHashed;
        await user.save();
        return res.status(200).json({ message: "done" });
    };
    verifyGoogleAcc = async (idToken) => {
        const client = new google_auth_library_1.OAuth2Client();
        const ticket = await client.verifyIdToken({
            idToken,
            audience: config_service_1.env.CLIENT_ID,
        });
        const payload = ticket.getPayload();
        if (!payload)
            throw new error_response_1.BadRequestException("Payload isn't defined, plz try later");
        return payload;
    };
    googleLogin = async (req, res) => {
        const { idToken } = req.body;
        const { email, email_verified, name: username, picture, } = await this.verifyGoogleAcc(idToken);
        if (!email_verified || !email || !username)
            throw new error_response_1.BadRequestException("Email not verified");
        if (!email_verified)
            throw new error_response_1.BadRequestException("Email not verified");
        let user = await user_model_1.userModel.findOne({ email });
        if (!user) {
            user = await user_model_1.userModel.create({
                confirmedAt: new Date(),
                email,
                username,
                profilePic: picture ?? "",
                provider: user_enum_1.ProviderEnum.Google,
            });
        }
        const tokens = (0, tokens_security_1.getNewLoginCredentials)(user);
        return res
            .status(201)
            .json({ message: "Signup & Login successfully", tokens });
    };
    refreshToken = async (req, res) => {
        const tokens = (0, tokens_security_1.getNewLoginCredentials)(req.user);
        return res.status(200).json({ message: "done", tokens });
    };
}
exports.default = new AuthService();
