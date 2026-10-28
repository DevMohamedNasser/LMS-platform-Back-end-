"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.schema = void 0;
const graphql_1 = require("graphql");
const graphql_types_1 = require("./graphql.types");
const error_response_1 = require("../../Utils/response/error.response");
const user_enum_1 = require("../../Utils/enums/user.enum");
const user_model_1 = require("../../DB/Models/user.model");
const exam_model_1 = require("../../DB/Models/exam.model");
const examResult_model_1 = require("../../DB/Models/examResult.model");
const rootQuery = new graphql_1.GraphQLObjectType({
    name: "Query",
    fields: {
        users: {
            type: new graphql_1.GraphQLList(graphql_types_1.UserType),
            args: {
                grade: { type: graphql_1.GraphQLInt },
                page: { type: graphql_1.GraphQLInt, defaultValue: 1 },
                limit: { type: graphql_1.GraphQLInt, defaultValue: 10 },
            },
            resolve: (_parent, args, ctx) => {
                if (!ctx.user)
                    throw new error_response_1.UnauthorizedException("U must be logged in");
                if (ctx.user.role !== user_enum_1.RoleEnum.ADMIN)
                    throw new error_response_1.ForbiddenException("Unauthorized action. Only admin can do this");
                const limit = Math.min(args.limit, 50);
                const skip = (args.page - 1) * limit;
                return user_model_1.userModel
                    .find({ ...(args.grade && { grade: args.grade }) })
                    .skip(skip)
                    .limit(limit);
            },
        },
        exams: {
            type: new graphql_1.GraphQLList(graphql_types_1.ExamType),
            args: {
                grade: { type: graphql_1.GraphQLInt },
                page: { type: graphql_1.GraphQLInt, defaultValue: 1 },
                limit: { type: graphql_1.GraphQLInt, defaultValue: 10 },
            },
            resolve: (_parent, args, ctx) => {
                if (!ctx.user)
                    throw new error_response_1.UnauthorizedException("U must be logged in");
                if (ctx.user.role !== user_enum_1.RoleEnum.ADMIN)
                    throw new error_response_1.ForbiddenException("Unauthorized action. Only admin can do this");
                const limit = Math.min(args.limit, 50);
                const skip = (args.page - 1) * limit;
                return exam_model_1.examModel
                    .find({ ...(args.grade && { grade: args.grade }) })
                    .skip(skip)
                    .limit(limit);
            },
        },
        examResults: {
            type: new graphql_1.GraphQLList(graphql_types_1.ExamResultsType),
            args: {
                grade: { type: graphql_1.GraphQLInt },
                page: { type: graphql_1.GraphQLInt, defaultValue: 1 },
                limit: { type: graphql_1.GraphQLInt, defaultValue: 10 },
            },
            resolve: (_parent, args, ctx) => {
                if (!ctx.user)
                    throw new error_response_1.UnauthorizedException("U must be logged in");
                if (ctx.user.role !== user_enum_1.RoleEnum.ADMIN)
                    throw new error_response_1.ForbiddenException("Unauthorized action. Only admin can do this");
                const limit = Math.min(args.limit, 50);
                const skip = (args.page - 1) * limit;
                return examResult_model_1.examResultModel
                    .find({ ...(args.grade && { grade: args.grade }) })
                    .populate("student")
                    .populate("exam")
                    .skip(skip)
                    .limit(limit);
            },
        },
    },
});
exports.schema = new graphql_1.GraphQLSchema({
    query: rootQuery,
});
