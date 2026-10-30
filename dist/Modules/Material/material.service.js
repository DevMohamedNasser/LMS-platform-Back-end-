"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const S3_service_1 = __importDefault(require("../../Utils/service/S3.service"));
const material_model_1 = require("../../DB/Models/material.model");
const error_response_1 = require("../../Utils/response/error.response");
const user_enum_1 = require("../../Utils/enums/user.enum");
// import { MulterStorageEnum } from "../../Utils/enums/multer/cloud.enum";
class MaterialService {
    constructor() { }
    /** Upload through Front-end client to AWS S3 (Use it when server is heavy/weak) */
    // createMaterial = async (req: Request, res: Response) => {
    //   console.log(req.file);
    //   const { title, content, grade }: ICreateMaterialDTO = req.body;
    //   // let files = [];
    //   // if (req.file) {
    //   //   let file = await S3Service.uploadFile({
    //   //     storageKey: MulterStorageEnum.DiskStorage,
    //   //     file: req.file,
    //   //     contentType: req.file.mimetype
    //   //   });
    //   //   files.push(file);
    //   //   console.log(file);
    //   // }
    //   // console.log(files);
    //   // await materialModel.create({
    //   //   title,
    //   //   content,
    //   //   grade,
    //   //   ...(req.file && { material: files }),
    //   // });
    //   let files = [];
    //   if (req.file) {
    //     /** Upload through Back-end server to AWS S3 (More secure) */
    // let file = await S3Service.uploadBigFile({
    //   storageKey: MulterStorageEnum.DiskStorage,
    //   file: req.file,
    //   contentType: req.file.mimetype,
    // });
    //     files.push(file);
    //   }
    //   await materialModel.create({
    //     title,
    //     content,
    //     grade,
    //     ...(req.file && { material: files }),
    //   });
    //   return res.status(200).json({ message: "done" });
    // };
    /** Upload through Front-end client to AWS S3 (Use it when server is heavy/weak) */
    createMaterial = async (req, res) => {
        const { title, content, grade } = req.body;
        const isExist = await material_model_1.materialModel.findOne({ title });
        if (isExist)
            throw new error_response_1.ConflictException("File with this title already exists");
        const { url, key } = await S3_service_1.default.createPreSignedUrl({
            Originalname: title,
        });
        await material_model_1.materialModel.create({
            title,
            ...(content && { content }),
            grade,
            material: [key],
        });
        return res
            .status(200)
            .json({ message: "choose ur file in less than 2 minutes", data: url });
    };
    listAllMaterials = async (req, res) => {
        const { grade } = req.query;
        const user = req.user;
        if (user.role === user_enum_1.RoleEnum.USER && user.grade === undefined)
            throw new error_response_1.BadRequestException("Please choose your grade first");
        const filter = user.role === user_enum_1.RoleEnum.ADMIN
            ? { ...(grade && { grade }) }
            : { grade: user.grade };
        const data = await material_model_1.materialModel.find(filter);
        return res.status(200).json({ message: "done", data });
    };
    getMaterial = async (req, res) => {
        const { id } = req.params;
        const material = await material_model_1.materialModel.findById(id);
        if (!material) {
            throw new error_response_1.NotFoundException("Material not found");
        }
        if (material.grade != req.user?.grade && req.user?.role !== user_enum_1.RoleEnum.ADMIN)
            throw new error_response_1.NotFoundException("Material not found or Unauthorized action");
        const files = await Promise.all(material.material.map(async (key) => {
            const url = await S3_service_1.default.createGetPreSignedUrl({ Key: key });
            return { url };
        }));
        return res.status(200).json({
            message: "done",
            data: {
                ...material.toObject(),
                material: files,
            },
        });
    };
    deleteMaterial = async (req, res) => {
        const { id } = req.params;
        const material = await material_model_1.materialModel.findById(id);
        if (!material)
            throw new error_response_1.NotFoundException("File not found");
        const result = await S3_service_1.default.deleteFile({
            key: material.material[0],
        });
        await material_model_1.materialModel.findByIdAndDelete(id);
        return res.status(200).json({ message: "done", data: result });
    };
}
exports.default = new MaterialService();
