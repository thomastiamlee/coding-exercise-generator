const Component = require("./src/component");
const Restriction = require("./src/restriction");
const Reader = require("./src/reader");
const Parser = require("./src/parser");
const Planner = require("./src/planner-simple");
const VisualizationServer = require("./src/visualization-server");

var kb = Parser.parseKnowledgeBase("./src/kb/simple-space.txt");
Planner.planExercise(kb, ["student", "student"]);

// VisualizationServer.start();