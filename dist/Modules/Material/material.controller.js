"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const material_service_1 = __importDefault(require("./material.service"));
const validation_middleware_1 = require("../../Middlewares/validation.middleware");
const validators = __importStar(require("./material.validation"));
const authentication_middleware_1 = require("../../Middlewares/authentication.middleware");
const user_enum_1 = require("../../Utils/enums/user.enum");
// import { fileValidation, uploadFile } from "../../Utils/multer/cloud.multer";
// import { MulterStorageEnum } from "../../Utils/enums/multer/cloud.enum";
const router = (0, express_1.Router)();
/** Upload through Front-end client to AWS S3 (Use it when server is heavy/weak) */
// router.post(
//   "/",
//   authentication({ tokenType: TokenTypeEnum.access }),
//   authorization({ accessRoles: [RoleEnum.ADMIN] }),
//   uploadFile({
//     storageKey: MulterStorageEnum.DiskStorage,
//     validation: [
//       ...fileValidation.image,
//       ...fileValidation.document,
//       ...fileValidation.video,
//     ],
//     maxSizeMB: 20,
//   }).single("file"),
//   validation(validators.createMaterialBodySchema),
//   materialService.createMaterial,
// );
/** Upload through Front-end client to AWS S3 (Use it when server is heavy/weak) */
router.post("/", (0, validation_middleware_1.validation)(validators.createMaterialBodySchema), (0, authentication_middleware_1.authentication)({ tokenType: authentication_middleware_1.TokenTypeEnum.access }), (0, authentication_middleware_1.authorization)({ accessRoles: [user_enum_1.RoleEnum.ADMIN] }), material_service_1.default.createMaterial);
router.get("/list-all", (0, authentication_middleware_1.authentication)({ tokenType: authentication_middleware_1.TokenTypeEnum.access }), material_service_1.default.listAllMaterials);
router.get("/:id", (0, validation_middleware_1.validation)(validators.mongoIdSchema), (0, authentication_middleware_1.authentication)({ tokenType: authentication_middleware_1.TokenTypeEnum.access }), material_service_1.default.getMaterial);
router.delete("/:id", (0, validation_middleware_1.validation)(validators.mongoIdSchema), (0, authentication_middleware_1.authentication)({ tokenType: authentication_middleware_1.TokenTypeEnum.access }), (0, authentication_middleware_1.authorization)({ accessRoles: [user_enum_1.RoleEnum.ADMIN] }), material_service_1.default.deleteMaterial);
exports.default = router;
