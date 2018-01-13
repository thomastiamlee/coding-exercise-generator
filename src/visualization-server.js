"use strict"

const Path = require("path");
const Hapi = require("hapi");
const Vision = require("vision");
const Nunjucks = require("nunjucks-hapi");
const Reader = require("./reader");
const fs = require("fs");
const Parser = require("./parser");
const ExerciseBuilder = require("./exercise-builder");
const Planner = require("./planner-simple");
const PlannerUtility = require("./planner-utility");
const Generator = require("./generator");
const TextGenerator = require("./text-generator");

function start() {
	// Create a server with a host and port
	const server = new Hapi.Server();
	server.connection({
		host: "localhost",
		port: 8000
	});

	server.register([require("inert"), Vision], (err) => {
		if (err) {
			throw err;
		}
		
		// Views
		server.views({
			engines: {
				html: Nunjucks
			},
			path: "./src/views"
		})
		
		// CSS, JS, and IMG resources
		server.route({
			method: "GET",
			path: "/resource/{file*}",
			handler: {
				directory: {
					path: "./src/resources/"
				}
			}
		});
		
		// Visualize page	
		server.route({
			method: "GET",
			path: "/visualize",
			handler: function(request, reply) {
				if (request.query.name) {
					var file = "./src/resources/exercises/" + request.query.name + ".exc";
					var text = fs.readFileSync(file, "utf-8");
					var flowchart = Reader.convertToFlowchartDefinition(Reader.loadExercise(file));
					return reply.view("visualization.html", {text: text, flowchart: flowchart});
				}
				else {
					return reply.view("visualization.html", {text: "", flowchart: ""});
				}
			}
		});
		
		// Generate test page
		server.route({
			method: "GET",
			path: "/generatetest",
			handler: function(request, reply) {
				var kb = Parser.parseKnowledgeBase("./src/kb/revised-space");
				var table = new PlannerUtility.memory();
				table.createLocalEntity(kb.getGlobalEntity("person"));
				var actionList = Planner.planExercise(kb, table);
				var text = "";
				for (var i = 0; i < actionList.length; i++) {
					text += actionList[i].action.name + " ";
					for (var j = 0; j < actionList[i].parameters.length; j++) {
						text += actionList[i].parameters[j].name + " ";
					}
					text += "\n";
				}
				var exercise = ExerciseBuilder.buildExerciseFromActions(actionList, table);
				var flowchart = Reader.convertToFlowchartDefinition(exercise);
				return reply.view("generation-test.html", {text: text, flowchart: flowchart});
			}
		});
		
		server.route({
			method: "GET",
			path: "/generatetest2",
			handler: function(request, reply) {
				var exercise = Generator.generateBasicExercise({complexity: 3});
				var flowchart = Reader.convertToFlowchartDefinition(exercise);
				var text = TextGenerator.convertExerciseToNativeText(exercise.head, exercise.symbols);
				return reply.view("generation-test.html", {text: text, flowchart: flowchart});
			}
		});
		
		// Start the server
		server.start((err) => {
			if (err) {
				throw err;
			}
			console.log("Server running at:", server.info.uri);
		});
	});
}

module.exports = {start};