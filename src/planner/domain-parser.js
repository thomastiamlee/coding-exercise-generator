const File = require("fs");
const Peg = require("pegjs");

const domainPath = "./src/planner/domain";
const grammarPath = "./src/planner/grammar";

function parseExistents() {
	var grammar = File.readFileSync(grammarPath + "/existents-grammar.txt", "utf-8");
	var existents = File.readFileSync(domainPath + "/existents.txt", "utf-8");
	var parser = Peg.generate(grammar, {trace: false});
	var result = parser.parse(existents);
	console.log(result);
}

function parseAssertions() {
	
}


function parseDomain() {
	var existents = parseExistents();
}

module.exports = {parseDomain};