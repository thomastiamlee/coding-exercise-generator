const Parser = require("./parser");
const PlannerUtility = require("./planner-utility");

/* Attempts to plan an exercise, given the initial space.
The space is an array containing non-primitive type names
that will serve as possible elements in the story. */
function planExercise(kb, table) {
	// Create an object for each space element
	var table = new PlannerUtility.memory();
	
	var plan = [];
	
	// Extract all actions
	var actions = kb.getAction();
	var lookup = [];
	for (var i = 0; i < actions.length; i++) {
		
	}
	
	return {plan: plan, table, table};
}


module.exports = {planExercise};