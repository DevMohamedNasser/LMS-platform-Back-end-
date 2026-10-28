"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExamResultsType = exports.ExamType = exports.UserType = void 0;
const graphql_1 = require("graphql");
exports.UserType = new graphql_1.GraphQLObjectType({
    name: "User",
    fields: () => ({
        id: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLID) },
        firstName: { type: graphql_1.GraphQLString },
        lastName: { type: graphql_1.GraphQLString },
        email: { type: graphql_1.GraphQLString },
        phone: { type: graphql_1.GraphQLString },
        address: { type: graphql_1.GraphQLString },
        grade: { type: graphql_1.GraphQLString },
        role: { type: graphql_1.GraphQLString },
        createdAt: { type: graphql_1.GraphQLString },
        fullName: {
            type: graphql_1.GraphQLString,
            resolve: (parent) => `${parent.firstName} ${parent.lastName}`,
        },
    }),
});
/** ___________________________ exam schema ___________________________ */
const QuestionOptionType = new graphql_1.GraphQLObjectType({
    name: "Option",
    fields: () => ({
        id: { type: graphql_1.GraphQLID },
        text: { type: graphql_1.GraphQLString },
    }),
});
const QuestionType = new graphql_1.GraphQLObjectType({
    name: "Question",
    fields: () => ({
        id: { type: graphql_1.GraphQLID },
        question: { type: graphql_1.GraphQLString },
        options: { type: new graphql_1.GraphQLList(QuestionOptionType) },
        correctAns: { type: graphql_1.GraphQLID },
    }),
});
exports.ExamType = new graphql_1.GraphQLObjectType({
    name: "Exam",
    fields: () => ({
        id: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLID) },
        title: { type: graphql_1.GraphQLString },
        grade: { type: graphql_1.GraphQLInt },
        questions: { type: new graphql_1.GraphQLList(QuestionType) },
        durationMin: { type: graphql_1.GraphQLInt },
    }),
});
const WrongAnsType = new graphql_1.GraphQLObjectType({
    name: "WrongAns",
    fields: {
        questionId: { type: graphql_1.GraphQLID },
        answer: { type: graphql_1.GraphQLID },
    },
});
exports.ExamResultsType = new graphql_1.GraphQLObjectType({
    name: "ExamResults",
    fields: () => ({
        id: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLID) },
        student: { type: exports.UserType },
        exam: { type: exports.ExamType },
        grade: { type: graphql_1.GraphQLInt },
        startedAt: { type: graphql_1.GraphQLString },
        score: { type: graphql_1.GraphQLFloat },
        wrongAns: { type: new graphql_1.GraphQLList(WrongAnsType) },
    }),
});
