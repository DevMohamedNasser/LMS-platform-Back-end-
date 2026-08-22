export enum gradeEnum {
  first = 1,
  second = 2,
  third = 3,
  fourth = 4,
  fifth = 5,
  sixth = 6,
  firstPrep = 7,
}

export const gradeValues: number[] = Object.values(gradeEnum).filter(
  (grade) => typeof grade == "number",
);
/**
 * Object.values(gradeEnum) =====> returns keys and values so we make gradeValues function
 *  that returns array of numbers check if each value is number it will return the number
 */
