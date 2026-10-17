import { Request, Response } from "express";
import { ICreateMaterialDTO } from "./material.dto";
import S3Service from "../../Utils/service/S3.service";
import { MulterStorageEnum } from "../../Utils/enums/multer/cloud.enum";
import { materialModel } from "../../DB/Models/material.model";

class MaterialService {
  constructor() {}

  createMaterial = async (req: Request, res: Response) => {
    console.log(req.file);
    const { title, content, grade }: ICreateMaterialDTO = req.body;

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
      let file = await S3Service.uploadBigFile({
        storageKey: MulterStorageEnum.DiskStorage,
        file: req.file,
        contentType: req.file.mimetype,
      });
      files.push(file);
    }
    await materialModel.create({
      title,
      content,
      grade,
      ...(req.file && { material: files }),
    });

    return res.status(200).json({ message: "done" });
  };
}

export default new MaterialService();
