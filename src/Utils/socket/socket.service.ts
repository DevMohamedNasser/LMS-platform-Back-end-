import { Server, Socket } from "socket.io";
import { Server as nodeHttpServer } from "node:http";
import { HUserDocument } from "../../DB/Models/user.model";
import {
  decodedToken,
  TokenTypeEnum,
} from "../../Middlewares/authentication.middleware";
import chalk from "chalk";
import { registerChatEvents } from "./chat.socket";

export interface IAuthedSocket extends Socket {
  user?: HUserDocument;
}

let io: Server | null = null;

export const getIo = (): Server | null => io;

export const initializeSocket = (httpServer: nodeHttpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: "*",
    },
  });

  /** authentication Middleware */
  io.use(async (socket: IAuthedSocket, next) => {
    try {
      //   const authorization = socket.handshake.auth.token;
      const authorization = socket.handshake.headers.authorization;
      const { user } = await decodedToken({
        authorization,
        tokenType: TokenTypeEnum.access,
      });

      socket.user = user;

      next();
    } catch (error) {
      next(new Error((error as Error).message) || "Unauthorized socket");
    }
  });

  io.on("connection", (socket: IAuthedSocket) => {
    const user = socket.user;
    const userId = user?._id.toString() as string;

    socket.join(userId);
    registerChatEvents(io!, socket);
  });

  console.log(chalk.green(`[Socket] socket.io server is ready`));
  return io;
};
