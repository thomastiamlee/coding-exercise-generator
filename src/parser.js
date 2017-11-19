const fs = require("fs");
const Peg = require("pegjs");

/* Parses the knowledge base and returns a JavaScript object containing all its rules. */
function parseKnowledgeBase(path) {
	console.log("parsing knowledge base...");
	var grammar = fs.readFileSync("./src/grammar/domain.txt", "utf-8");
	var kb = fs.readFileSync(path, "utf-8");
	var parser = Peg.generate(grammar, {trace: false});
	
	var result = parser.parse(kb);
	console.log(result);
	return result;
}

module.exports = {parseKnowledgeBase};