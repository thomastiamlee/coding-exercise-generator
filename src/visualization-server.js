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
				var kb = Parser.parseKnowledgeBase("./src/kb/test-space.txt");
				var res = Planner.planExercise(kb, ["person"]);
				var text = "";
				for (var i = 0; i < res.plan.length; i++) {
					text += res.plan[i].action.name + " ";
					text += res.plan[i].parameters.join(", ") + "\n";
					
				}
				var exercise = ExerciseBuilder.buildExerciseFromActions(res.plan, res.table);
				var flowchart = Reader.convertToFlowchartDefinition(exercise);
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