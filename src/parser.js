const fs = require("fs");
const Peg = require("pegjs");

/* Parses the knowledge base and returns a JavaScript object containing all its rules. */
function parseKnowledgeBase() {
	var grammar = fs.readFileSync("./src/grammar/domain.txt", "utf-8");
	var kb = fs.readFileSync("./src/kb/kb.txt", "utf-8");
	var parser = Peg.generate(grammar);
	
	parser.parse(kb);
}

module.exports = {parseKnowledgeBase};