const Component = require("./src/component");
const Restriction = require("./src/restriction");
const Reader = require("./src/reader");
const Parser = require("./src/parser");
const Planner = require("./src/planner-simple");
const VisualizationServer = require("./src/visualization-server");

var kb = Parser.parseKnowledgeBase("./src/kb/test-space.txt");
var plan = Planner.planExercise(kb, ["person"]);
console.log(plan);

// VisualizationServer.start();