"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const config_service_1 = require("../Config/config.service");
const chalk_1 = __importDefault(require("chalk"));
const connectDB = async () => {
    try {
        mongoose_1.default.connection.on("connected", () => {
            console.log(chalk_1.default.green(`DB connected successfully`));
        });
        await mongoose_1.default.connect(config_service_1.env.DB_URI, {
            serverSelectionTimeoutMS: 5000,
        });
    }
    catch (error) {
        console.log(chalk_1.default.red(`Error connecting DB`, error.message));
        throw error;
    }
};
exports.default = connectDB;
