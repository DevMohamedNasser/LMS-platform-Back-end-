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
exports.examModel = exports.examSchema = exports.questionSchema = exports.optionSchema = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const exam_enum_1 = require("../../Utils/enums/exam.enum");
exports.optionSchema = new mongoose_1.Schema({
    text: {
        type: String,
        required: true,
    },
}, { timestamps: false });
exports.questionSchema = new mongoose_1.Schema({
    question: {
        type: String,
        required: true,
    },
    options: [
        {
            type: exports.optionSchema,
            required: true,
        },
    ],
    correctAns: {
        type: mongoose_1.Types.ObjectId,
        required: true,
    },
}, { timestamps: false });
exports.examSchema = new mongoose_1.Schema({
    title: {
        type: String,
        required: true,
    },
    grade: {
        type: Number,
        enum: exam_enum_1.gradeValues,
        required: true,
    },
    durationMin: {
        type: Number,
        default: 30,
    },
    questions: [exports.questionSchema],
}, {
    timestamps: true,
});
// Compound Index
exports.examSchema.index({ title: 1, grade: -1 }, { unique: true });
exports.examSchema.index({ createdAt: 1 }, { expireAfterSeconds: Number(60 * 60 * 24 * 3) });
exports.examModel = mongoose_1.default.models.Exam || mongoose_1.default.model("Exam", exports.examSchema);
