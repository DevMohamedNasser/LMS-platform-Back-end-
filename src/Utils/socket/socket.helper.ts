import { Socket } from "socket.io";
import { ZodType } from "zod";
import { ApplicationExceptions } from "../response/error.response";

export const handleEvent = <TSchema extends ZodType>(
  socket: Socket,
  eventName: string,
  schema: TSchema,
  handler: (data: ReturnType<TSchema["parse"]>) => Promise<unknown> | unknown,
) => {
  return async (raw?: unknown): Promise<void> => {
    try {
      let parsedRaw = raw;

      // Handle empty payloads from Socket Tester
      if (typeof raw === "string") {
        parsedRaw = raw.trim() === "" ? undefined : JSON.parse(raw);
      }

      const results = schema.safeParse(parsedRaw);

      if (!results.success) {
        socket.emit("socketError", {
          event: eventName,
          error: results.error.issues[0]?.message ?? "Invalid data",
        });
        return;
      }

      await handler(results.data as ReturnType<TSchema["parse"]>);
    } catch (error) {
      console.error(`[Socket Error: ${eventName}]`, error);

      socket.emit("socketError", {
        event: eventName,
        error:
          error instanceof ApplicationExceptions
            ? error.message
            : "Something went wrong",
      });
    }
  };
};