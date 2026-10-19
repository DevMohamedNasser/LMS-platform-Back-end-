import express, { Express, Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import chalk from "chalk";
import { env } from "./Config/config.service";
import { corsOptions } from "./Utils/cors/cors";
// import rateLimit, { RateLimitRequestHandler } from "express-rate-limit";
import { customRateLimiter } from "./Middlewares/rateLimit.middleware";
import {
  BadRequestException,
  globalErrorHandler,
  NotFoundException,
} from "./Utils/response/error.response";
import { authRouter, examRouter, MaterialRouter } from "./Modules";
import connectDB from "./DB/connection";
import path from "node:path";
import S3Service from "./Utils/service/S3.service";
import { promisify } from "node:util";
import { pipeline } from "node:stream";

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

  // تاخد ال Body from AWS + Response عشان اقدر اعمل convert له يكون readable واضيف ف الاخر الداتا لل response تروح للفرونت اند
  const s3GetFile = promisify(pipeline); // promisify حاجه تستقبل promise خصوصًا ال stream , اما pipeline ماسوره تستقبل ال buffer from AWS

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

  app.get("/uploads/*path", async (req: Request, res: Response) => {
    const { path } = req.params as { path: string[] };
    if (!path || path.length === 0)
      throw new BadRequestException("Path not found");

    const key = path.join("/");
    const { Body, ContentType } = await S3Service.getFile({ key }); // هعمل لل Body: read as stream واباصيه للفرونت اند
    s3GetFile(Body as NodeJS.ReadableStream, res);

    // set cross origin policy
    res.set("Cross-Origin-Resource-Policy", "cross-origin");
    res.setHeader("Content-Type", ContentType || "application/octet-stream");

    return res;
  });

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
