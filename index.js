const Component = require("./src/component");
const Restriction = require("./src/restriction");
const Reader = require("./src/reader");
const Parser = require("./src/parser");
const Planner = require("./src/planner-simple");
const VisualizationServer = require("./src/visualization-server");

//var result = Reader.loadExercise("./test/sample/sample1.exc");
//Reader.convertToFlowchartDefinition(result);

VisualizationServer.start();