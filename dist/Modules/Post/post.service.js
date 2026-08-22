"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const error_response_1 = require("../../Utils/response/error.response");
const exam_model_1 = require("../../DB/Models/exam.model");
class PostService {
    constructor() { }
    createPost = async (req, res) => {
        const { content } = req.body;
        const files = req.files;
        if (!content && !files?.length)
            throw new error_response_1.BadRequestException("Request must have content or attachments");
        const post = await exam_model_1.postModel.create({
            ...(content && { content }),
            ...(files && { attachments: files.map(file => file.path) }),
            createdBy: req.user.id
        });
        return res.status(201).json({ message: "Created successfully", post });
    };
}
exports.default = new PostService();
