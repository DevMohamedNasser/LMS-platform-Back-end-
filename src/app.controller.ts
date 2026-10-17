import express, { Express, Request, Response } from "express";
// import type { Express } from "express";
import cors from "cors";
import helmet from "helmet";
import chalk from "chalk";
import { env } from "./Config/config.service";
import { corsOptions } from "./Utils/cors/cors";
// import rateLimit, { RateLimitRequestHandler } from "express-rate-limit";
import { customRateLimiter } from "./Middlewares/rateLimit.middleware";
import {
  globalErrorHandler,
  NotFoundException,
} from "./Utils/response/error.response";
import { authRouter, examRouter, MaterialRouter } from "./Modules";
import connectDB from "./DB/connection";
import path from "node:path";

// const limiter: RateLimitRequestHandler = rateLimit({
//   windowMs: env.WINDOW_MS,
//   limit: env.RATE_LIMIT,
//   message: {
//     status: 429,
//     message: "Too Many Requests, Plz try again later"
//   },
//   standardHeaders: "draft-8",
//   legacyHeaders: false
// })

const bootstrap = async (): Promise<void> => {
  const app: Express = express();

  // app.use(helmet(), cors(corsOptions), limiter);
  app.use(helmet(), cors(corsOptions), customRateLimiter());
  app.use(express.json());
  await connectDB();

  app.get("/", (req: Request, res: Response) => {
    return res.status(200).json({ message: `Welcome To ${env.APP_NAME} App` });
  });

  app.use("/uploads", express.static(path.resolve("./uploads")));
  app.use("/api/v1/auth", authRouter);
  app.use("/api/v1/exam", examRouter);
  app.use("/api/v1/material", MaterialRouter);

  app.use("/:dummy", (req: Request, res: Response) => {
    throw new NotFoundException("Not Found Handler (Route)");
  });

  app.use(globalErrorHandler);

  app.listen(env.PORT, () => {
    console.log(
      chalk.bgGreen(`Server is running on http://127.0.0.1:${env.PORT}`),
    );
  });
};

export default bootstrap;
