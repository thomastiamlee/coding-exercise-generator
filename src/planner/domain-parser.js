const File = require("fs");
const Peg = require("pegjs");
const PlannerComponents = require("./planner-components");

const domainPath = "./src/planner/domain";
const grammarPath = "./src/planner/grammar";

function parseExistents() {
	var grammar = File.readFileSync(grammarPath + "/existents-grammar.txt", "utf-8");
	var existents = File.readFileSync(domainPath + "/existents.txt", "utf-8");
	var parser = Peg.generate(grammar, {trace: false});
	var result = parser.parse(existents);
	return result;
}

function parseAssertions() {
	var grammar = File.readFileSync(grammarPath + "/assertions-grammar.txt", "utf-8");
	var existents = File.readFileSync(domainPath + "/assertions.txt", "utf-8");
	var parser = Peg.generate(grammar, {trace: false});
	var result = parser.parse(existents);
	return result;
}

function parseActions() {
	var grammar = File.readFileSync(grammarPath + "/actions-grammar.txt", "utf-8");
	var parser = Peg.generate(grammar, {trace: false});
	var result = [];
	File.readdirSync(domainPath + "/actions").forEach(file => {
		var actions = File.readFileSync(domainPath + "/actions/" + file.toString(), "utf-8");
		var temp = parser.parse(actions);
		result = result.concat(temp);
	});
	return result;
}

function parseLogicActions() {
	var grammar = File.readFileSync(grammarPath + "/logic-grammar.txt", "utf-8");
	var parser = Peg.generate(grammar, {trace: false});
	var result = [];
	File.readdirSync(domainPath + "/logic").forEach(file => {
		var actions = File.readFileSync(domainPath + "/logic/" + file.toString(), "utf-8");
		var temp = parser.parse(actions);
		result = result.concat(temp);
	});
	return result;
}

function parseDomain() {
	var existents = parseExistents();
	var assertions = parseAssertions();
	var actions = parseActions();
	var logicActions = parseLogicActions();
	
	return new PlannerComponents.domain(existents, assertions, actions, logicActions);
}

module.exports = {parseDomain};