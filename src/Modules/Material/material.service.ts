import { Request, Response } from "express";
import { ICreateMaterialDTO } from "./material.dto";
import S3Service from "../../Utils/service/S3.service";
import { materialModel } from "../../DB/Models/material.model";
import {
  ConflictException,
  NotFoundException,
} from "../../Utils/response/error.response";
import { RoleEnum } from "../../Utils/enums/user.enum";
// import { MulterStorageEnum } from "../../Utils/enums/multer/cloud.enum";

class MaterialService {
  constructor() {}

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
  createMaterial = async (req: Request, res: Response) => {
    const { title, content, grade }: ICreateMaterialDTO = req.body;

    const isExist = await materialModel.findOne({ title });
    if (isExist)
      throw new ConflictException("File with this title already exists");

    const { url, key } = await S3Service.createPreSignedUrl({
      Originalname: title,
    });

    await materialModel.create({
      title,
      ...(content && { content }),
      grade,
      material: [key],
    });

    return res
      .status(200)
      .json({ message: "choose ur file in less than 2 minutes", data: url });
  };

  listAllMaterials = async (req: Request, res: Response): Promise<Response> => {
    const { grade } = req.query as unknown as { grade?: number };
    const user = req.user!;

    const filter =
      user.role === RoleEnum.ADMIN
        ? { ...(grade && { grade }) }
        : { grade: user.grade };

    const data = await materialModel.find(filter);

    return res.status(200).json({ message: "done", data });
  };

  getMaterial = async (req: Request, res: Response) => {
    const { id } = req.params;

    const material = await materialModel.findById(id);
    if (!material) {
      throw new NotFoundException("Material not found");
    }

    if (material.grade != req.user?.grade && req.user?.role !== RoleEnum.ADMIN)
      throw new NotFoundException("Material not found or Unauthorized action");

    const files = await Promise.all(
      material.material.map(async (key) => {
        const url = await S3Service.createGetPreSignedUrl({ Key: key });

        return { url };
      }),
    );

    return res.status(200).json({
      message: "done",
      data: {
        ...material.toObject(),
        material: files,
      },
    });
  };

  deleteMaterial = async (req: Request, res: Response): Promise<Response> => {
    const { id } = req.params;

    const material = await materialModel.findById(id);
    if (!material) throw new NotFoundException("File not found");

    const result = await S3Service.deleteFile({
      key: material.material[0] as string,
    });

    await materialModel.findByIdAndDelete(id);

    return res.status(200).json({ message: "done", data: result });
  };
}

export default new MaterialService();
