const fs = require("fs");
const Peg = require("pegjs");
const PlannerUtility = require("./planner-utility");

/* Parses the knowledge base and returns a JavaScript object containing all its rules. */
function parseKnowledgeBase(path) {
	var grammar = fs.readFileSync("./src/grammar/domain.txt", "utf-8");
	var kb = fs.readFileSync(path, "utf-8");
	var parser = Peg.generate(grammar, {trace: false});
	
	var result = parser.parse(kb);
	PlannerUtility.sortKnowledgeBase(result);
	return result;
}

module.exports = {parseKnowledgeBase};