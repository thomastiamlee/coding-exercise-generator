const Parser = require("./parser");
const PlannerUtility = require("./planner-utility");

/* Attempts to plan an exercise, given the initial space.
The space is an array containing non-primitive type names
that will serve as possible elements in the story. */
function planExercise(space) {
	var kb = Parser.parseKnowledgeBase("./src/kb/simple-space.txt");
	// Create an object for each space element
	var table = PlannerUtility.initializeMemoryTable(space, kb);
	
	// Search for available actions
	var actionList = kb.action_list;
	for (var i = 0; i < actionList.length; i++) {
		console.log("Checking: " + actionList[i].name);
		var possible = PlannerUtility.getAllPossibleActionVariableReplacements(actionList[i], table, kb);
		for (var j = 0; j < possible.length; j++) {
			console.log(possible[j]);
		}
	}
}


module.exports = {planExercise};