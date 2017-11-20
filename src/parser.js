const fs = require("fs");
const Peg = require("pegjs");

/* Parses the knowledge base and returns a JavaScript object containing all its rules. */
function parseKnowledgeBase(path) {
	var grammar = fs.readFileSync("./src/grammar/domain.txt", "utf-8");
	var kb = fs.readFileSync(path, "utf-8");
	var parser = Peg.generate(grammar, {trace: false});
	
	var result = parser.parse(kb);
	sortKnowledgeBase(result);
	return result;
}

function addType(kb, type) {
	kb.type_list.push(type);
	sortKnowledgeBase(kb);
}

function addAssertion(kb, assertion) {
	
}


/* This function sorts the knowledge base's types and actions
lexicographically. */
function sortKnowledgeBase(kb) {
	// Sort types and action lists
	kb.type_list = kb.type_list.sort(function(a, b) {
		if (a[0] < b[0]) return -1;
		else if (a[0] > b[0]) return 1;
		return 0;
	});
	kb.action_list = kb.action_list.sort(function(a, b) {
		if (a.name < b.name) return -1;
		else if (a.name > b.name) return 1;
		return 0;
	});
}

module.exports = {parseKnowledgeBase, addType};