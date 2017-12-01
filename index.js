const Component = require("./src/component");
const Restriction = require("./src/restriction");
const Reader = require("./src/reader");
const Parser = require("./src/parser");
const Planner = require("./src/planner-simple");
const VisualizationServer = require("./src/visualization-server");
const ExerciseBuilder = require("./src/exercise-builder");
/*
var kb = Parser.parseKnowledgeBase("./src/kb/test-space.txt");
var res = Planner.planExercise(kb, ["person"]);
//console.log(res.plan);
var exercise = ExerciseBuilder.buildExerciseFromActions(res.plan, res.table);
//console.log(exercise.head);



 console.log(Reader.convertToFlowchartDefinition(exercise));
*/
VisualizationServer.start();