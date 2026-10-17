"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const S3_service_1 = __importDefault(require("../../Utils/service/S3.service"));
const cloud_enum_1 = require("../../Utils/enums/multer/cloud.enum");
const material_model_1 = require("../../DB/Models/material.model");
class MaterialService {
    constructor() { }
    createMaterial = async (req, res) => {
        console.log(req.file);
        const { title, content, grade } = req.body;
        // let files = [];
        // if (req.file) {
        //   let file = await S3Service.uploadFile({
        //     storageKey: MulterStorageEnum.DiskStorage,
        //     file: req.file,
        //     contentType: req.file.mimetype
        //   });
        //   files.push(file);
        //   console.log(file);
        // }
        // console.log(files);
        // await materialModel.create({
        //   title,
        //   content,
        //   grade,
        //   ...(req.file && { material: files }),
        // });
        let files = [];
        if (req.file) {
            let file = await S3_service_1.default.uploadBigFile({
                storageKey: cloud_enum_1.MulterStorageEnum.DiskStorage,
                file: req.file,
                contentType: req.file.mimetype,
            });
            files.push(file);
        }
        await material_model_1.materialModel.create({
            title,
            content,
            grade,
            ...(req.file && { material: files }),
        });
        return res.status(200).json({ message: "done" });
    };
}
exports.default = new MaterialService();
