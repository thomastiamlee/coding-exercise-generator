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
	var visited = [];
	var available = [];
	visited.push(table);
	available.push(PlannerUtility.getAvailableActions(kb, table));
	
	while (true) {
		var currentOptions = available[visited.length - 1];
		var currentTable = visited[visited.length - 1];
		
		if (currentOptions.length == 0) {
			if (visited.length == 1) {
				return null;
			}
			else {
				visited.splice(visited.length - 1, 1);
				available.splice(available.length - 1, 1);
				plan.splice(plan.length - 1, 1);
			}
		}
		else {
			var randomIndex = Math.floor(Math.random() * currentOptions.length);
			var chosenAction = currentOptions[randomIndex];
			var cloneTable = currentTable.cloneMemory();
			currentOptions.splice(randomIndex, 1);
			PlannerUtility.executeAction(kb, cloneTable, chosenAction.action, chosenAction.parameters);
			var success = true;
			for (var i = 0; i < visited.length; i++) {
				if (visited[i].isEquivalent(cloneTable)) {
					success = false;
					break;
				}
			}
			if (success) {
				plan.push(chosenAction);
				visited.push(cloneTable);
				available.push(PlannerUtility.getAvailableActions(kb, cloneTable));
			}
		}
		
		if (PlannerUtility.assertionIsTrue(kb, visited[visited.length - 1], {truth: true, predicate: "completed", parameters: []})) {
			break;
		}
	}
	
	return {plan: plan, table: visited[visited.length - 1]};
}


module.exports = {planExercise};