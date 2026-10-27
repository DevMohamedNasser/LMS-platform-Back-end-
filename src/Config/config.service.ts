import { resolve } from "node:path";
import dotenv from "dotenv";

dotenv.config({ path: resolve("./Config/dev.env") });

export const env = {
  // App
  PORT: Number(process.env.PORT),
  MODE: process.env.MODE || "DEVELOPMENT",
  APP_NAME: process.env.APP_NAME || "Social Media",

  // DB
  DB_URI: process.env
    .DB_URI as string /** Type Assertion: Tell TS if probability to be undefined plz trust me it's string & will come don't throw error */,

  // Hashing
  SALT: Number(process.env.SALT),

  // Email
  EMAIL_USERNAME: process.env.EMAIL_USERNAME as string,
  EMAIL_PASSWORD: process.env.EMAIL_PASSWORD as string,
  EMAIL_HOST: process.env.EMAIL_HOST as string,
  EMAIL_PORT: process.env.EMAIL_PORT as string,

  //   jwt
  ACCESS_TOKEN_USER_SIGNATURE: process.env
    .ACCESS_TOKEN_USER_SIGNATURE as string,
  REFRESH_TOKEN_USER_SIGNATURE: process.env
    .REFRESH_TOKEN_USER_SIGNATURE as string,
  ACCESS_TOKEN_USER_EXPIRES_IN: Number(
    process.env.ACCESS_TOKEN_USER_EXPIRES_IN,
  ),
  REFRESH_TOKEN_USER_EXPIRES_IN: Number(
    process.env.REFRESH_TOKEN_USER_EXPIRES_IN,
  )!,

  ACCESS_TOKEN_ADMIN_SIGNATURE: process.env
    .ACCESS_TOKEN_ADMIN_SIGNATURE as string,
  REFRESH_TOKEN_ADMIN_SIGNATURE: process.env
    .REFRESH_TOKEN_ADMIN_SIGNATURE as string,
  ACCESS_TOKEN_ADMIN_EXPIRES_IN: Number(
    process.env.ACCESS_TOKEN_ADMIN_EXPIRES_IN,
  ),
  REFRESH_TOKEN_ADMIN_EXPIRES_IN: Number(
    process.env.REFRESH_TOKEN_ADMIN_EXPIRES_IN,
  )!,

  // Google OAuth
  CLIENT_ID: process.env.CLIENT_ID as string,

  //   Encryption
  ENCRYPTION_SECRET_KEY: process.env.ENCRYPTION_SECRET_KEY as string,

  WHITE_LIST: process.env.WHITE_LIST!,
  RATE_LIMIT: Number(process.env.RATE_LIMIT),
  WINDOW_MS: Number(process.env.WINDOW_MS),

  // AWS S3
  ACCESS_KEY: process.env.ACCESS_KEY as string,
  SECRET_ACCESS_KEY: process.env.SECRET_ACCESS_KEY as string,
  BUCKET_NAME: process.env.BUCKET_NAME,

  // Firebase notifications
  FIREBASE_SYSTEM_ACCOUNT: "./Config/lms-notifications-6e12f-firebase-adminsdk-fbsvc-5fce517517.json" as string,
};

export type Env = typeof env;
