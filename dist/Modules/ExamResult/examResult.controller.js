"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authentication_middleware_1 = require("../../Middlewares/authentication.middleware");
const router = (0, express_1.Router)();
router.use((0, authentication_middleware_1.authentication)({ tokenType: authentication_middleware_1.TokenTypeEnum.access }));
exports.default = router;
