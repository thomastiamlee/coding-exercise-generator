"use strict"

const Path = require("path");
const Hapi = require("hapi");
const Vision = require("vision");
const Nunjucks = require("nunjucks-hapi");
const Reader = require("./reader");
const fs = require("fs");
const Generator = require("./naive/generator");
const NaiveTextGenerator = require("./naive/text-generator");
const DomainParser = require("./planner/domain-parser");
const Planner = require("./planner/planner");
const PlannerTextGenerator = require("./planner/text-generator");
const ExerciseBuilder = require("./planner/exercise-builder");


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
				var domain = DomainParser.parseDomain();
				var plan = Planner.plan(domain);
				var text = PlannerTextGenerator.convertPlanToText(plan);
				var exercise = ExerciseBuilder.generateExercise(plan);
				
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
				var text = NaiveTextGenerator.convertExerciseToNativeText(exercise.head, exercise.symbols);
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