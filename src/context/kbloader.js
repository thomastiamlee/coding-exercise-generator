const fs = require("fs");

/* Returns the entire knowledge base information as a JavaScript object. */
function loadKnowledgeBase() {
	kb = {};
	kb.goals = loadGoals();
	
	return kb;
}

/* Reads the goals.kb file and returns the information in an array. */
function loadGoals() {
	var data = fs.readFileSync("src/context/kb/goals.kb", "utf-8").split("\r\n");
	var result = [];
	var current = 0;
	while (current < data.length) {
		var goal = {};
		goal.name = data[current];
		goal.subgoals = [];
		current++;
		current++;
		while (data[current] != "#end") {
			goal.subgoals.push(data[current]);
			current++;
		}
		current++;
		result.push(goal);
	}
	return result;
}

module.exports = {loadGoals, loadKnowledgeBase};