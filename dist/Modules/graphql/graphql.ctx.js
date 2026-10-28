"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildCtx = void 0;
const authentication_middleware_1 = require("../../Middlewares/authentication.middleware");
const buildCtx = async (authorization) => {
    if (!authorization)
        return {};
    try {
        const { user } = await (0, authentication_middleware_1.decodedToken)({
            authorization,
            tokenType: authentication_middleware_1.TokenTypeEnum.access,
        });
        return { user };
    }
    catch (error) {
        return {};
    }
};
exports.buildCtx = buildCtx;
