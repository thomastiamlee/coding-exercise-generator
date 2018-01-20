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
}


function parseDomain() {
	var existents = parseExistents();
	var assertions = parseAssertions();
}

module.exports = {parseDomain};