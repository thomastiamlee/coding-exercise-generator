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
		// console.log("Chosen: ");
		// console.log(chosen.action);
		actionList.push(chosen);
		PlannerUtility.executeAction(kb, table, chosen);
	}
	return actionList;
}


module.exports = {planExercise};