import {
  GraphQLInt,
  GraphQLList,
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString,
} from "graphql";
import { ExamResultsType, ExamType, UserType } from "./graphql.types";
import { IGraphQLCtx } from "./graphql.ctx";
import {
  ForbiddenException,
  UnauthorizedException,
} from "../../Utils/response/error.response";
import { RoleEnum } from "../../Utils/enums/user.enum";
import { userModel } from "../../DB/Models/user.model";
import { examModel } from "../../DB/Models/exam.model";
import { examResultModel } from "../../DB/Models/examResult.model";

const rootQuery = new GraphQLObjectType({
  name: "Query",
  fields: {
    users: {
      type: new GraphQLList(UserType),
      args: {
        grade: { type: GraphQLInt },
        page: { type: GraphQLInt, defaultValue: 1 },
        limit: { type: GraphQLInt, defaultValue: 10 },
      },
      resolve: (_parent, args, ctx: IGraphQLCtx) => {
        if (!ctx.user) throw new UnauthorizedException("U must be logged in");

        if (ctx.user.role !== RoleEnum.ADMIN)
          throw new ForbiddenException(
            "Unauthorized action. Only admin can do this",
          );

        const limit = Math.min(args.limit, 50);
        const skip = (args.page - 1) * limit;

        return userModel
          .find({ ...(args.grade && { grade: args.grade }) })
          .skip(skip)
          .limit(limit);
      },
    },

    exams: {
      type: new GraphQLList(ExamType),
      args: {
        grade: { type: GraphQLInt },
        page: { type: GraphQLInt, defaultValue: 1 },
        limit: { type: GraphQLInt, defaultValue: 10 },
      },
      resolve: (_parent, args, ctx: IGraphQLCtx) => {
        if (!ctx.user) throw new UnauthorizedException("U must be logged in");

        if (ctx.user.role !== RoleEnum.ADMIN)
          throw new ForbiddenException(
            "Unauthorized action. Only admin can do this",
          );

        const limit = Math.min(args.limit, 50);
        const skip = (args.page - 1) * limit;

        return examModel
          .find({ ...(args.grade && { grade: args.grade }) })
          .skip(skip)
          .limit(limit);
      },
    },
    examResults: {
      type: new GraphQLList(ExamResultsType),
      args: {
        grade: { type: GraphQLInt },
        page: { type: GraphQLInt, defaultValue: 1 },
        limit: { type: GraphQLInt, defaultValue: 10 },
      },
      resolve: (_parent, args, ctx: IGraphQLCtx) => {
        if (!ctx.user) throw new UnauthorizedException("U must be logged in");

        if (ctx.user.role !== RoleEnum.ADMIN)
          throw new ForbiddenException(
            "Unauthorized action. Only admin can do this",
          );

        const limit = Math.min(args.limit, 50);
        const skip = (args.page - 1) * limit;

        return examResultModel
          .find({ ...(args.grade && { grade: args.grade }) })
          .populate("student")
          .populate("exam")
          .skip(skip)
          .limit(limit);
      },
    },
  },
});

export const schema = new GraphQLSchema({
  query: rootQuery,
});
