const Parser = require("./parser");
const PlannerUtility = require("./planner-utility");

/* Attempts to plan an exercise, given the initial space.
The space is an array containing non-primitive type names
that will serve as possible elements in the story. */
function planExercise(kb, table) {
	var actionList = [];
	while (true) {
		var choices = PlannerUtility.getAvailableActions(kb, table);
		if (choices.length == 0) {
			break;
		}
		var chosen = choices[Math.floor(Math.random() * choices.length)];
		actionList.push(chosen);
		console.log(chosen.action.name);
		
		PlannerUtility.executeAction(kb, table, chosen);
		if (PlannerUtility.isComputedAction(chosen.action)) {
			console.log("ended");
			break;
		}
	}
	return actionList;
}


module.exports = {planExercise};