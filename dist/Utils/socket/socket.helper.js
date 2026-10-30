"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleEvent = void 0;
const error_response_1 = require("../response/error.response");
const handleEvent = (socket, eventName, schema, handler) => {
    return async (raw) => {
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
            await handler(results.data);
        }
        catch (error) {
            console.error(`[Socket Error: ${eventName}]`, error);
            socket.emit("socketError", {
                event: eventName,
                error: error instanceof error_response_1.ApplicationExceptions
                    ? error.message
                    : "Something went wrong",
            });
        }
    };
};
exports.handleEvent = handleEvent;
