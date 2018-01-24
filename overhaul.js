const PlannerComponents = require("./src/planner/planner-components");
const DomainParser = require("./src/planner/domain-parser");
const TextGenerator = require("./src/planner/text-generator");
const Planner = require("./src/planner/planner");
const ExerciseBuilder = require("./src/planner/exercise-builder");
const TestCaseGenerator = require("./src/planner/test-case-generator");

var domain = DomainParser.parseDomain();
var plan = Planner.plan(domain, ["convert_pounds_to_kilograms"], 1);
var text = TextGenerator.convertPlanToText(plan);
var exercise = ExerciseBuilder.generateExercise(plan);
var testCases = TestCaseGenerator.generateTestCases(exercise, 10);
console.log("Text: " + text);
console.log(testCases);