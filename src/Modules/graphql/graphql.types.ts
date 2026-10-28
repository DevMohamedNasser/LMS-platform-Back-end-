import {
  GraphQLFloat,
  GraphQLID,
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString,
} from "graphql";
import { IUser } from "../../DB/Models/user.model";

export const UserType = new GraphQLObjectType({
  name: "User",
  fields: () => ({
    id: { type: new GraphQLNonNull(GraphQLID) },
    firstName: { type: GraphQLString },
    lastName: { type: GraphQLString },
    email: { type: GraphQLString },
    phone: { type: GraphQLString },
    address: { type: GraphQLString },
    grade: { type: GraphQLString },
    role: { type: GraphQLString },
    createdAt: { type: GraphQLString },

    fullName: {
      type: GraphQLString,
      resolve: (parent: IUser) => `${parent.firstName} ${parent.lastName}`,
    },
  }),
});

/** ___________________________ exam schema ___________________________ */
const QuestionOptionType = new GraphQLObjectType({
  name: "Option",
  fields: () => ({
    id: { type: GraphQLID },
    text: { type: GraphQLString },
  }),
});

const QuestionType = new GraphQLObjectType({
  name: "Question",
  fields: () => ({
    id: { type: GraphQLID },
    question: { type: GraphQLString },
    options: { type: new GraphQLList(QuestionOptionType) },
    correctAns: { type: GraphQLID },
  }),
});

export const ExamType = new GraphQLObjectType({
  name: "Exam",
  fields: () => ({
    id: { type: new GraphQLNonNull(GraphQLID) },
    title: { type: GraphQLString },
    grade: { type: GraphQLInt },
    questions: { type: new GraphQLList(QuestionType) },
    durationMin: { type: GraphQLInt },
  }),
});

const WrongAnsType = new GraphQLObjectType({
  name: "WrongAns",
  fields: {
    questionId: { type: GraphQLID },
    answer: { type: GraphQLID },
  },
});

export const ExamResultsType = new GraphQLObjectType({
  name: "ExamResults",
  fields: () => ({
    id: { type: new GraphQLNonNull(GraphQLID) },
    student: { type: UserType },
    exam: { type: ExamType },
    grade: { type: GraphQLInt },
    startedAt: { type: GraphQLString },
    score: { type: GraphQLFloat },
    wrongAns: { type: new GraphQLList(WrongAnsType) },
  }),
});
