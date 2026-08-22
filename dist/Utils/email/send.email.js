"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const error_response_1 = require("../response/error.response");
const config_service_1 = require("../../Config/config.service");
const sendEmail = async (data) => {
    if (!data.html && !data.attachments?.length && !data.text)
        throw new error_response_1.BadRequestException("Missing Email Content");
    const transporter = nodemailer_1.default.createTransport({
        service: "Gmail",
        auth: {
            user: config_service_1.env.EMAIL_USERNAME,
            pass: config_service_1.env.EMAIL_PASSWORD,
        },
    });
    await transporter.sendMail({
        ...data,
        from: `"LMS" <${config_service_1.env.EMAIL_USERNAME}>`,
    });
};
exports.sendEmail = sendEmail;
