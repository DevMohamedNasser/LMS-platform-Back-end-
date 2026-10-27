"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const chalk_1 = __importDefault(require("chalk"));
const config_service_1 = require("./Config/config.service");
const cors_2 = require("./Utils/cors/cors");
// import rateLimit, { RateLimitRequestHandler } from "express-rate-limit";
const rateLimit_middleware_1 = require("./Middlewares/rateLimit.middleware");
const error_response_1 = require("./Utils/response/error.response");
const Modules_1 = require("./Modules");
const connection_1 = __importDefault(require("./DB/connection"));
const node_path_1 = __importDefault(require("node:path"));
const S3_service_1 = __importDefault(require("./Utils/service/S3.service"));
const node_util_1 = require("node:util");
const node_stream_1 = require("node:stream");
const firebase_config_1 = require("./Utils/firebase/firebase.config");
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
const bootstrap = async () => {
    const app = (0, express_1.default)();
    (0, firebase_config_1.initializeFirebase)();
    // تاخد ال Body from AWS + Response عشان اقدر اعمل convert له يكون readable واضيف ف الاخر الداتا لل response تروح للفرونت اند
    const s3GetFile = (0, node_util_1.promisify)(node_stream_1.pipeline); // promisify حاجه تستقبل promise خصوصًا ال stream , اما pipeline ماسوره تستقبل ال buffer from AWS
    // app.use(helmet(), cors(corsOptions), limiter);
    app.use((0, helmet_1.default)(), (0, cors_1.default)(cors_2.corsOptions), (0, rateLimit_middleware_1.customRateLimiter)());
    app.use(express_1.default.json());
    await (0, connection_1.default)();
    app.get("/", (req, res) => {
        return res.status(200).json({ message: `Welcome To ${config_service_1.env.APP_NAME} App` });
    });
    app.use("/uploads", express_1.default.static(node_path_1.default.resolve("./uploads")));
    app.use("/api/v1/auth", Modules_1.authRouter);
    app.use("/api/v1/exam", Modules_1.examRouter);
    app.use("/api/v1/material", Modules_1.MaterialRouter);
    app.get("/uploads/*path", async (req, res) => {
        const { path } = req.params;
        if (!path || path.length === 0)
            throw new error_response_1.BadRequestException("Path not found");
        const key = path.join("/");
        const { Body, ContentType } = await S3_service_1.default.getFile({ key }); // هعمل لل Body: read as stream واباصيه للفرونت اند
        s3GetFile(Body, res);
        // set cross origin policy
        res.set("Cross-Origin-Resource-Policy", "cross-origin");
        res.setHeader("Content-Type", ContentType || "application/octet-stream");
        return res;
    });
    app.use("/:dummy", (req, res) => {
        throw new error_response_1.NotFoundException("Not Found Handler (Route)");
    });
    app.use(error_response_1.globalErrorHandler);
    app.listen(config_service_1.env.PORT, () => {
        console.log(chalk_1.default.bgGreen(`Server is running on http://127.0.0.1:${config_service_1.env.PORT}`));
    });
};
exports.default = bootstrap;
