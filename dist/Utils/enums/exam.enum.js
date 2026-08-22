"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.gradeValues = exports.gradeEnum = void 0;
var gradeEnum;
(function (gradeEnum) {
    gradeEnum[gradeEnum["first"] = 1] = "first";
    gradeEnum[gradeEnum["second"] = 2] = "second";
    gradeEnum[gradeEnum["third"] = 3] = "third";
    gradeEnum[gradeEnum["fourth"] = 4] = "fourth";
    gradeEnum[gradeEnum["fifth"] = 5] = "fifth";
    gradeEnum[gradeEnum["sixth"] = 6] = "sixth";
    gradeEnum[gradeEnum["firstPrep"] = 7] = "firstPrep";
})(gradeEnum || (exports.gradeEnum = gradeEnum = {}));
exports.gradeValues = Object.values(gradeEnum).filter((grade) => typeof grade == "number");
/**
 * Object.values(gradeEnum) =====> returns keys and values so we make gradeValues function
 *  that returns array of numbers check if each value is number it will return the number
 */
