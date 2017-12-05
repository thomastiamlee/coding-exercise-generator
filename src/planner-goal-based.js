const Parser = require("./parser");
const PlannerUtility = require("./planner-utility");

/* Attempts to plan an exercise, given the initial space.
The space is an array containing non-primitive type names
that will serve as possible elements in the story. */
function planExercise(kb, space) {
	// Create an object for each space element
	var table = new PlannerUtility.memory();
	
	var plan = [];
		
	return {plan: plan, table, table};
}


module.exports = {planExercise};