const Parser = require("./parser");
const PlannerUtility = require("./planner-utility");

/* Attempts to plan an exercise, given the initial space.
The space is an array containing non-primitive type names
that will serve as possible elements in the story. */
function planExercise(kb, table) {
	while (true) {
		var choices = PlannerUtility.getAvailableActions(kb, table);
		if (choices.length == 0) {
			break;
		}
		var chosen = choices[Math.floor(Math.random() * choices.length)];
		console.log("Chosen: " + chosen.action.name);
		PlannerUtility.executeAction(kb, table, chosen);
	}
}


module.exports = {planExercise};