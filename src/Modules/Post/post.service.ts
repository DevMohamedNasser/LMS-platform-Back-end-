import { Request, Response } from "express";
import { ICreatePostDTO } from "./post.dto";
import { BadRequestException } from "../../Utils/response/error.response";
import { postModel } from "../../DB/Models/exam.model";

class PostService {
  constructor() {}

  createPost = async (req: Request, res: Response): Promise<Response> => {
    const { content }: ICreatePostDTO = req.body;
    const files = req.files as Express.Multer.File[] | undefined;

    if (!content && !files?.length)
        throw new BadRequestException("Request must have content or attachments")

    const post = await postModel.create({
        ...(content && {content}),
        ...(files && {attachments: files.map(file => file.path)}),
        createdBy: req.user!.id
    })

    return res.status(201).json({message: "Created successfully", post})
  };
}

export default new PostService();
