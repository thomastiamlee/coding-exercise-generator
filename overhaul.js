const PlannerComponents = require("./src/planner/planner-components");
const DomainParser = require("./src/planner/domain-parser");
const TextGenerator = require("./src/planner/text-generator");
const Planner = require("./src/planner/planner");
const ExerciseBuilder = require("./src/planner/exercise-builder");

var domain = DomainParser.parseDomain();
var plan = Planner.plan(domain);
//var text = TextGenerator.convertPlanToText(plan);
//var exercise = ExerciseBuilder.generateExercise(plan);
//console.log(text);