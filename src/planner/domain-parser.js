const File = require("fs");
const Peg = require("pegjs");

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
	console.log(result);
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
	console.log(result);
}

function parseDomain() {
	var existents = parseExistents();
	var assertions = parseAssertions();
	var actions = parseActions();
}

module.exports = {parseDomain};