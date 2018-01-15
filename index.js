const Component = require("./src/component");
const Restriction = require("./src/restriction");
const Reader = require("./src/reader");
const Parser = require("./src/parser");
const Planner = require("./src/planner-simple");
const VisualizationServer = require("./src/visualization-server");
const ExerciseBuilder = require("./src/exercise-builder");
const PlannerUtility = require("./src/planner-utility");
const ExperimentServer = require("./experiment/server");
const TextGenerator = require("./src/text-generator");
const Generator = require("./src/generator");
const TestCaseGenerator = require("./src/test-case-generator");
/*
var kb = Parser.parseKnowledgeBase("./src/kb/revised-space");
var table = new PlannerUtility.memory();
table.createLocalEntity([kb.getGlobalEntity("person")]);
var plan = Planner.planExercise(kb, table);
var exercise = ExerciseBuilder.buildExerciseFromActions(plan, table);
var res = TextGenerator.convertPlanToText(plan, "./src/kb/revised-space");
var testCases = TestCaseGenerator.generateTestCases(exercise, 10);

console.log(res);
console.log(testCases);
*/
//var text = TextGenerator.loadTemplates();

//var exercise = Generator.generateBasicExercise({complexity: 3});
//TestCaseGenerator.generateTestCases(exercise, 10);

//VisualizationServer.start();

ExperimentServer.start();