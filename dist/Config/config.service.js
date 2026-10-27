"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const node_path_1 = require("node:path");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config({ path: (0, node_path_1.resolve)("./Config/dev.env") });
exports.env = {
    // App
    PORT: Number(process.env.PORT),
    MODE: process.env.MODE || "DEVELOPMENT",
    APP_NAME: process.env.APP_NAME || "Social Media",
    // DB
    DB_URI: process.env
        .DB_URI /** Type Assertion: Tell TS if probability to be undefined plz trust me it's string & will come don't throw error */,
    // Hashing
    SALT: Number(process.env.SALT),
    // Email
    EMAIL_USERNAME: process.env.EMAIL_USERNAME,
    EMAIL_PASSWORD: process.env.EMAIL_PASSWORD,
    EMAIL_HOST: process.env.EMAIL_HOST,
    EMAIL_PORT: process.env.EMAIL_PORT,
    //   jwt
    ACCESS_TOKEN_USER_SIGNATURE: process.env
        .ACCESS_TOKEN_USER_SIGNATURE,
    REFRESH_TOKEN_USER_SIGNATURE: process.env
        .REFRESH_TOKEN_USER_SIGNATURE,
    ACCESS_TOKEN_USER_EXPIRES_IN: Number(process.env.ACCESS_TOKEN_USER_EXPIRES_IN),
    REFRESH_TOKEN_USER_EXPIRES_IN: Number(process.env.REFRESH_TOKEN_USER_EXPIRES_IN),
    ACCESS_TOKEN_ADMIN_SIGNATURE: process.env
        .ACCESS_TOKEN_ADMIN_SIGNATURE,
    REFRESH_TOKEN_ADMIN_SIGNATURE: process.env
        .REFRESH_TOKEN_ADMIN_SIGNATURE,
    ACCESS_TOKEN_ADMIN_EXPIRES_IN: Number(process.env.ACCESS_TOKEN_ADMIN_EXPIRES_IN),
    REFRESH_TOKEN_ADMIN_EXPIRES_IN: Number(process.env.REFRESH_TOKEN_ADMIN_EXPIRES_IN),
    // Google OAuth
    CLIENT_ID: process.env.CLIENT_ID,
    //   Encryption
    ENCRYPTION_SECRET_KEY: process.env.ENCRYPTION_SECRET_KEY,
    WHITE_LIST: process.env.WHITE_LIST,
    RATE_LIMIT: Number(process.env.RATE_LIMIT),
    WINDOW_MS: Number(process.env.WINDOW_MS),
    // AWS S3
    ACCESS_KEY: process.env.ACCESS_KEY,
    SECRET_ACCESS_KEY: process.env.SECRET_ACCESS_KEY,
    BUCKET_NAME: process.env.BUCKET_NAME,
    // Firebase notifications
    FIREBASE_SYSTEM_ACCOUNT: "./Config/lms-notifications-6e12f-firebase-adminsdk-fbsvc-5fce517517.json",
};
