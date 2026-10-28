"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorization = exports.authentication = exports.decodedToken = exports.TokenTypeEnum = void 0;
const user_model_1 = require("../DB/Models/user.model");
const tokens_security_1 = require("../Utils/Security/tokens.security");
const user_enum_1 = require("../Utils/enums/user.enum");
const error_response_1 = require("../Utils/response/error.response");
var TokenTypeEnum;
(function (TokenTypeEnum) {
    TokenTypeEnum["access"] = "access";
    TokenTypeEnum["refresh"] = "refresh";
})(TokenTypeEnum || (exports.TokenTypeEnum = TokenTypeEnum = {}));
const decodedToken = async ({ authorization, tokenType = TokenTypeEnum.access, }) => {
    const [Bearer, token] = authorization?.split(" ") || [];
    if (!Bearer || !token)
        throw new error_response_1.BadRequestException("Invalid authentication format in headers");
    const signature = (0, tokens_security_1.getSignature)({
        signatureLevel: Bearer === user_enum_1.RoleEnum.ADMIN ? user_enum_1.RoleEnum.ADMIN : user_enum_1.RoleEnum.USER,
    });
    const decoded = (0, tokens_security_1.verifyToken)({
        token,
        secret: tokenType === TokenTypeEnum.access
            ? signature.accessToken
            : signature.refreshToken,
    });
    const user = await user_model_1.userModel.findOne({ _id: decoded.id });
    if (!user)
        throw new Error("User not found");
    if (user.deletedAt)
        throw new error_response_1.NotFoundException("Account has been deleted");
    return { decoded, user };
};
exports.decodedToken = decodedToken;
const authentication = ({ tokenType = TokenTypeEnum.access, }) => {
    return async (req, res, next) => {
        const { decoded, user } = (await (0, exports.decodedToken)({
            authorization: req.headers.authorization,
            tokenType: tokenType,
        })) || {};
        req.user = user;
        req.decoded = decoded;
        return next();
    };
};
exports.authentication = authentication;
const authorization = ({ accessRoles = [], }) => {
    return (req, res, next) => {
        if (!req.user)
            throw new error_response_1.ForbiddenException("Unauthorized access, plz login");
        if (!accessRoles.includes(req.user?.role))
            throw new error_response_1.ForbiddenException("Unauthorized access");
        return next();
    };
};
exports.authorization = authorization;
