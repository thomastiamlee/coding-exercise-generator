"use strict"

const Path = require("path");
const Hapi = require("hapi");
const Vision = require("vision");
const Nunjucks = require("nunjucks-hapi");
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
			path: "./experiment/views"
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
			path: "/",
			handler: function(request, reply) {
				return reply.view("index.html");
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