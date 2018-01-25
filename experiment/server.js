"use strict"

const Path = require("path");
const Hapi = require("hapi");
const Vision = require("vision");
const Nunjucks = require("nunjucks-hapi");
const fs = require("fs");

const Generator = require("../src/naive/generator");
const TestCaseGenerator = require("../src/naive/test-case-generator.js");
const TextGenerator = require("../src/naive/text-generator");

const Compile = require("./compile");
const DomainParser = require("../src/planner/domain-parser");
const Planner = require("../src/planner/planner");
const PlannerTextGenerator = require("../src/planner/text-generator");
const ExerciseBuilder = require("../src/planner/exercise-builder");

const functionName = "func";
const plannerKnowledgeBasePath = "src/kb/revised-space";

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
					path: "./experiment/resources/"
				}
			}
		});
		
		// Main page	
		server.route({
			method: "GET",
			path: "/",
			handler: function(request, reply) {
				reply.view("index.html");
			}
		});
		
		server.route({
			method: "GET",
			path: "/exercise/native",
			handler: function(request, reply) {
				function getInputSymbols(symbols, inputVariables) {
					var res = [];
					for (var i = 0; i < inputVariables.length; i++) {
						var name = getSymbolFromOperand(inputVariables[i], symbols);
						res.push(name);
					}
					return res;
				}
				function buildFunctionHeader(symbols, inputVariables) {
					var res = "int" + " ";
					res += functionName + "(";
					for (var i = 0; i < inputVariables.length; i++) {
						var name = getSymbolFromOperand(inputVariables[i], symbols);
						var type = inputVariables[i].type;
						var typeString = convertTypeToJava(type);
						res += typeString + " " + name;
						if (i != inputVariables.length - 1) {
							res += ", ";
						}
					}
					res += ") {";
					return res;
				}
				var complexity = 2;
				if (request.query.complexity) { complexity = request.query.complexity; }
				var exercise = Generator.generateBasicExercise({complexity: complexity});
				var testCases = TestCaseGenerator.generateTestCases(exercise, 100);
				var text = TextGenerator.convertExerciseToNativeText(exercise.head, exercise.symbols);
				var functionHeader = buildFunctionHeader(exercise.symbols, exercise.inputVariables);
				var inputSymbols = getInputSymbols(exercise.symbols, exercise.inputVariables);
				
				reply({exercise: exercise, testCases: testCases, text: text, functionHeader: functionHeader, inputSymbols: inputSymbols});
			}
		});
		
		server.route({
			method: "GET",
			path: "/exercise/planner",
			handler: function(request, reply) {
				function getInputSymbols(symbols, inputVariables) {
					var res = [];
					for (var i = 0; i < inputVariables.length; i++) {
						var name = getSymbolFromOperand(inputVariables[i], symbols);
						res.push(name);
					}
					return res;
				}
				function buildFunctionHeader(symbols, inputVariables, returnType) {
					var res = convertTypeToJava(returnType) + " ";
					res += functionName + "(";
					for (var i = 0; i < inputVariables.length; i++) {
						var name = getSymbolFromOperand(inputVariables[i], symbols);
						var type = inputVariables[i].type;
						var typeString = convertTypeToJava(type);
						res += typeString + " " + name;
						if (i != inputVariables.length - 1) {
							res += ", ";
						}
					}
					res += ") {";
					return res;
				}
				var domain = DomainParser.parseDomain();
				var plan = Planner.plan(domain);
				var text = PlannerTextGenerator.convertPlanToText(plan);
				var exercise = ExerciseBuilder.generateExercise(plan);
				var testCases = TestCaseGenerator.generateTestCases(exercise, 10);
				var functionHeader = buildFunctionHeader(exercise.symbols, exercise.inputVariables, exercise.returnType);
				var inputSymbols = getInputSymbols(exercise.symbols, exercise.inputVariables);
				
				reply({exercise: exercise, testCases: testCases, text: text, functionHeader: functionHeader, inputSymbols: inputSymbols});
			}
		});
		
		server.route({
			method: "GET",
			path: "/experiment/exercise",
			handler: function(request, reply) {
				function getInputSymbols(symbols, inputVariables) {
					var res = [];
					for (var i = 0; i < inputVariables.length; i++) {
						var name = getSymbolFromOperand(inputVariables[i], symbols);
						res.push(name);
					}
					return res;
				}
				function buildFunctionHeader(symbols, inputVariables, returnType) {
					var res = convertTypeToJava(returnType) + " ";
					res += functionName + "(";
					for (var i = 0; i < inputVariables.length; i++) {
						var name = getSymbolFromOperand(inputVariables[i], symbols);
						var type = inputVariables[i].type;
						var typeString = convertTypeToJava(type);
						res += typeString + " " + name;
						if (i != inputVariables.length - 1) {
							res += ", ";
						}
					}
					res += ") {";
					return res;
				}
				if (request.query.type == "planner") {
					var domain = DomainParser.parseDomain();
					var plan = Planner.plan(domain, JSON.parse(request.query.actions), request.query.complexity);
					var text = PlannerTextGenerator.convertPlanToText(plan);
					var exercise = ExerciseBuilder.generateExercise(plan);
					var testCases = TestCaseGenerator.generateTestCases(exercise, 10);
					var functionHeader = buildFunctionHeader(exercise.symbols, exercise.inputVariables, exercise.returnType);
					var inputSymbols = getInputSymbols(exercise.symbols, exercise.inputVariables);
				}
				else {
					var exercise = Generator.generateBasicExercise({complexity: request.query.complexity});
					var testCases = TestCaseGenerator.generateTestCases(exercise, 10);
					var text = TextGenerator.convertExerciseToNativeText(exercise.head, exercise.symbols);
					var functionHeader = buildFunctionHeader(exercise.symbols, exercise.inputVariables, exercise.returnType);
					var inputSymbols = getInputSymbols(exercise.symbols, exercise.inputVariables);
				}
				
				var problemNumber = request.query.problemNumber;
				if (problemNumber == 1) {
					fs.writeFileSync("problem-log.txt", "");
				}
				fs.appendFileSync("problem-log.txt", problemNumber + "\n" + text + "\n");
				
				reply({exercise: exercise, testCases: testCases, text: text, functionHeader: functionHeader, inputSymbols: inputSymbols});
			}
		});
		
		server.route({
			method: "POST",
			path: "/code/submit",
			handler: function(request, reply) {
				var code = request.payload.code;
				var testCases = JSON.parse(request.payload.testCases);
				
				function handler(status, data) {
					if (status == "failed") {
						reply({ status: "error", message: data });
					}
					else {
						var verdict = Compile.checkOutput(data, testCases);
						if (verdict.verdict == "passed") {
							fs.appendFileSync("problem-log.txt", "-\n");
							reply({ status: "passed" });
						}
						else {
							reply({ status: "failed", input: verdict.input, expected: verdict.expected, actual: verdict.actual});
						}
						
					}
				}
				var javaCode = Compile.runSubmission(code, testCases, handler);
			}
		});
		
		server.route({
			method: "POST",
			path: "/code/test",
			handler: function(request, reply) {
				var code = request.payload.code;
				var testParameters = JSON.parse(request.payload.testParameters);
				var testCases = [{parameters: testParameters}];
				
				function handler(status, data) {
					if (status == "failed") {
						reply({ status: "error", message: data });
					}
					else {
						reply({status: "success", returnValue: data.split("\r\n")[0]});
					}
				}
				
				var javaCode = Compile.runSubmission(code, testCases, handler);
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
		
function convertTypeToJava(type) {
	if (type == "number") return "double";
	if (type == "integer") return "int";
	if (type == "string") return "String";
}

function getSymbolFromOperand(operand, symbolMappings) {
	for (var i = 0; i < symbolMappings.length; i++) {
		if (symbolMappings[i].obj == operand) {
			return symbolMappings[i].name;
		}
	}
	return null;
}

function getOperandFromSymbol(name, symbolMappings) {
	for (var i = 0; i < symbolMappings.length; i++) {
		if (symbolMappings[i].name == name) {
			return symbolMappings[i].obj;
		}
	}
	return null;
}

module.exports = {start};