import mongoose from "mongoose";
import { env } from "../Config/config.service";
import chalk from "chalk";

const connectDB = async (): Promise<void> => {
  try {
    mongoose.connection.on("connected", () => {
      console.log(chalk.green(`DB connected successfully`));
    });

    await mongoose.connect(env.DB_URI, {
      serverSelectionTimeoutMS: 5000,
    });
  } catch (error) {
    console.log(chalk.red(`Error connecting DB`, (error as Error).message));
    throw error;
  }
};

export default connectDB;
