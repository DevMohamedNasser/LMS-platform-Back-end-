import { Request, Response } from "express";
import { IExamDTO, IExamParamsIdDTO, ISubmitExamBodyDTO } from "./exam.dto";
import { examModel, IExam } from "../../DB/Models/exam.model";
import { RoleEnum } from "../../Utils/enums/user.enum";
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from "../../Utils/response/error.response";
import { examResultModel } from "../../DB/Models/examResult.model";

class ExamService {
  constructor() {}

  createExam = async (req: Request, res: Response): Promise<Response> => {
    const { title, grade, duration, questions }: IExamDTO = req.body;

    const getAnsIdx = (ans: string): number => {
      switch (ans.toLowerCase()) {
        case "a":
          return 0;
        case "b":
          return 1;
        case "c":
          return 2;
        case "d":
          return 3;
        default:
          throw new BadRequestException(
            "Correct answer must be 'a', 'b', 'c' or 'd'",
          );
      }
    };

    if (req.user!.role !== RoleEnum.ADMIN)
      throw new ForbiddenException("Only admin can do this!!!");

    const formattedQuestions = questions.map((question) => ({
      question: question.question,
      options: question.options,
      correctAns: getAnsIdx(question.correctAns),
    }));

    const exam = await examModel.create({
      title,
      grade,
      durationMin: duration,
      questions: formattedQuestions,
    });

    return res.status(201).json({ message: "Created successfully", exam });
  };

  listExams = async (req: Request, res: Response): Promise<Response> => {
    if (req.user!.role === RoleEnum.ADMIN) {
      const exams = await examModel.find().sort({ grade: -1 });

      return res.status(200).json({ message: "done", data: { exams } });
    }
    const examsTitles = await examModel
      .find({ grade: req.user!.grade })
      .select("title");

    return res.status(200).json({ message: "done", data: { examsTitles } });
  };

  getExam = async (req: Request, res: Response): Promise<Response> => {
    // grade from user, exam id from params
    // check role
    // assign started date & return exam without answers

    const { id }: IExamParamsIdDTO = req.params as { id: string };

    const result = await examResultModel
      .findOne({
        exam: id,
        student: req.user!.id,
      })
      .populate("exam");

    if (req.user!.role === RoleEnum.USER) {
      if (result?.score) {
        const exam = result.exam as IExam;

        const detailedQuestions = exam.questions.map((question) => {
          const wrong = result.wrongAns?.find(
            (ans) => ans.questionId.toString() === question._id.toString(),
          );

          return {
            _id: question._id,
            question: question.question,
            options: question.options,
            correctAns: question.correctAns,
            ...(wrong && { wrongAns: wrong.answer }),
          };
        });

        return res
          .status(200)
          .json({
            message: "done",
            data: { score: result.score, questions: detailedQuestions },
          });
      } else {
        const exam = await examModel
          .findOne({ _id: id, grade: req.user!.grade })
          .select(
            "title durationMin questions.question questions.options questions._id",
          );
        if (!exam) throw new NotFoundException("Exam not found");

        if (!result?.startedAt) {
          await examResultModel.create({
            student: req.user!.id,
            exam: id,
            grade: req.user!.grade,
            startedAt: new Date(),
          });
        }

        return res.status(200).json({
          message: `U have only ${exam.durationMin} min to solve.`,
          data: {
            exam,
          },
        });
      }
    } else if (req.user!.role === RoleEnum.ADMIN) {
      const exam = await examModel.findById(id);

      return res.status(200).json({ message: "done", data: { exam } });
    }

    throw new Error("Something went wrong (Invalid role)");
    // return res.status(200).json({ message: "" });
  };

  submitExam = async (req: Request, res: Response): Promise<Response> => {
    const { id }: IExamParamsIdDTO = req.params as { id: string };
    const { answers }: ISubmitExamBodyDTO = req.body;

    const exam = await examModel.findById(id);
    if (!exam) throw new NotFoundException("Exam not found");

    if (answers.length !== exam.questions.length) {
      throw new BadRequestException("U must answer all questions");
    }

    const isExists = await examResultModel.findOne({
      exam: id,
      student: req.user!.id,
    });
    if (isExists?.score !== undefined)
      throw new BadRequestException(
        `Exam already submitted. Ur score is ${isExists.score}`,
      );
    if (!isExists) {
      throw new BadRequestException("Take Exam before submit it. Use API 'Get /api/v1/exam/:examId")
    }
    if ( Date.now() > isExists.startedAt.getTime() + exam.durationMin * 1000 * 60 )
      throw new BadRequestException("Timeout");

    const wrongAns = [];
    let correctCount: number = 0;

    // better performance than find as questionsMap.get() minimize Big O Notation search from O(n) for each search which means O(n*m) but Map make it O(n)
    const questionsMap = new Map(
      exam.questions.map((q) => [q._id.toString(), q]),
    );

    for (const studentAnswer of answers) {
      // const question = exam.questions.find(
      //   (q) => q._id.toString() === studentAnswer.questionId,
      // );
      // if (!question)
      //   throw new NotFoundException(
      //     `Question ${studentAnswer.questionId} doesn't belong to exam`,
      //   );

      const question = questionsMap.get(studentAnswer.questionId);

      if (!question)
        throw new NotFoundException(
          `Question ${studentAnswer.questionId} doesn't belong to exam`,
        );

      if (question.correctAns === studentAnswer.answer) {
        correctCount++;
      } else {
        wrongAns.push({
          questionId: question._id,
          answer: studentAnswer.answer,
        });
      }
    }

    const score = (correctCount / exam.questions.length) * 100;
    const roundedScore = Math.round(score * 100) / 100;

    const result = await examResultModel.findOneAndUpdate(
      {
        _id: isExists._id,
        score: { $exists: false },
      },
      { score: roundedScore, wrongAns },
      { returnDocument: "after" },
    );

    return res.status(200).json({ message: "done", data: { result } });
  };
}

export default new ExamService();
