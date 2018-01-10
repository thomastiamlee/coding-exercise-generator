const Component = require("./src/component");
const Restriction = require("./src/restriction");
const Reader = require("./src/reader");
const Parser = require("./src/parser");
const Planner = require("./src/planner-simple");
const VisualizationServer = require("./src/visualization-server");
const ExerciseBuilder = require("./src/exercise-builder");
const PlannerUtility = require("./src/planner-utility");
const ExperimentServer = require("./experiment/server");
/*
var kb = Parser.parseKnowledgeBase("./src/kb/revised-space.txt");
var table = new PlannerUtility.memory();
table.createLocalEntity(kb.getGlobalEntity("person"));
var actionList = Planner.planExercise(kb, table);

for (var i = 0; i < actionList.length; i++) {
	console.log(actionList[i].action.name);
}

var exercise = ExerciseBuilder.buildExerciseFromActions(actionList, table);
var flowchart = Reader.convertToFlowchartDefinition(exercise);
console.log(flowchart);
*/

var kb = Parser.parseKnowledgeBase("./src/kb/revised-space");
var table = new PlannerUtility.memory();
table.createLocalEntity([kb.getGlobalEntity("person"), kb.getGlobalEntity("person"), kb.getGlobalEntity("person")]);

var result = PlannerUtility.matchParametersWithLocalEntities(kb.getAction("computebmi"), table);
console.log(result);


//VisualizationServer.start();