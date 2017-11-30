"use strict"

const Path = require("path");
const Hapi = require("hapi");
const Vision = require("vision");
const Nunjucks = require("nunjucks-hapi");
const Reader = require("./reader");
const fs = require("fs");

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
		
		// Main page	
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