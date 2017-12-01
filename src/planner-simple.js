const Parser = require("./parser");
const PlannerUtility = require("./planner-utility");

/* Attempts to plan an exercise, given the initial space.
The space is an array containing non-primitive type names
that will serve as possible elements in the story. */
function planExercise(kb, space) {
	// Create an object for each space element
	var table = new PlannerUtility.memory();
	table.addSpaceFromType(space);
	
	var plan = [];
	
	// Search for available actions
	while (true) {
		var actions = PlannerUtility.getAvailableActions(kb, table);
		if (actions.length == 0) {
			break;
		}
		// Choose a random action
		var randomIndex = Math.floor(Math.random() * actions.length);
		var chosenAction = actions[randomIndex];
		plan.push(chosenAction);
		PlannerUtility.executeAction(kb, table, chosenAction.action, chosenAction.parameters);
		if (PlannerUtility.assertionIsTrue(kb, table, {truth: true, predicate: "completed", parameters: []})) {
			break;
		}
	}
	
	return {plan: plan, table, table};
}


module.exports = {planExercise};