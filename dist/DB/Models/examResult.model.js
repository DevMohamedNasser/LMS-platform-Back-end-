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
Object.defineProperty(exports, "__esModule", { value: true });
exports.examResultModel = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const exam_enum_1 = require("../../Utils/enums/exam.enum");
const examResultSchema = new mongoose_1.Schema({
    student: {
        type: mongoose_1.Types.ObjectId,
        ref: "User",
        required: true,
    },
    exam: {
        type: mongoose_1.Types.ObjectId,
        ref: "Exam",
        required: true,
    },
    grade: {
        type: Number,
        enum: exam_enum_1.gradeValues,
    },
    startedAt: {
        type: Date,
        required: true,
    },
    score: Number,
    wrongAns: [
        {
            questionId: {
                type: mongoose_1.Types.ObjectId,
            },
            answer: {
                type: Number,
                min: 0,
                max: 3,
            },
        },
    ],
}, { timestamps: true });
examResultSchema.index({ student: 1, exam: 1 }, { unique: true });
examResultSchema.index({ createdAt: 1 }, { expireAfterSeconds: Number(60 * 60 * 24 * 3) });
exports.examResultModel = mongoose_1.default.models.ExamResult || mongoose_1.default.model("ExamResult", examResultSchema);
