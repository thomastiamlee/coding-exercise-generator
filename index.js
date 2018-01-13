const Component = require("./src/component");
const Restriction = require("./src/restriction");
const Reader = require("./src/reader");
const Parser = require("./src/parser");
const Planner = require("./src/planner-simple");
const VisualizationServer = require("./src/visualization-server");
const ExerciseBuilder = require("./src/exercise-builder");
const PlannerUtility = require("./src/planner-utility");
const ExperimentServer = require("./experiment/server");

var kb = Parser.parseKnowledgeBase("./src/kb/experiment-space");
var table = new PlannerUtility.memory();
table.createLocalEntity([kb.getGlobalEntity("person"), kb.getGlobalEntity("person")]);
var plan = Planner.planExercise(kb, table);
VisualizationServer.start();

//ExperimentServer.start();