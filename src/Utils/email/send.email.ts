import nodemailer from "nodemailer";
import Mail from "nodemailer/lib/mailer";
import { BadRequestException } from "../response/error.response";
import { env } from "../../Config/config.service";

export const sendEmail = async (data: Mail.Options): Promise<void> => {
  if (!data.html && !data.attachments?.length && !data.text)
    throw new BadRequestException("Missing Email Content");

  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: env.EMAIL_USERNAME,
      pass: env.EMAIL_PASSWORD,
    },
  });
  await transporter.sendMail({
    ...data,
    from: `"LMS" <${env.EMAIL_USERNAME}>`,
  });
};
