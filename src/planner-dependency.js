const Parser = require("./parser");
const PlannerUtility = require("./planner-utility");

/* Attempts to plan an exercise, given the initial space.
The space is an array containing non-primitive type names
that will serve as possible elements in the story. */
function planExercise(kb, table) {
	// Create an object for each space element
	var plan = [];
		
	// Extract all actions
	var actions = kb.getAction();
	var lookup = [];
	
	while (lookup.length != 20) {
		var row = [];
		var possible = [];
		for (var i = 0; i < actions.length; i++) {
			var matches = PlannerUtility.getAllPossibleActionVariableReplacements(kb, table, actions[i]);
			if (matches.length > 0) {
				row.push(1);
				possible.push({action: i, parameters: matches[Math.floor(Math.random() * matches.length)]});
			}		
			else {
				row.push(0);
			}
		}
		
		if (possible.length == 0) {
			break;
		}
		else {
			// Choose random action
			var possibleIndex = Math.floor(Math.random() * possible.length);
			var action = actions[possible[possibleIndex].action];
			var parameters = possible[possibleIndex].parameters;
			plan.push({action: action, parameters: parameters});
			PlannerUtility.executeAction(kb, table, {action: action, parameters: parameters});
		}
		
		lookup.push(row);
	}
	
	for (var i = 0; i < plan.length; i++) {
		console.log(plan[i].action.name + " ");
	}
	
	return {plan: plan, table, table};
}


module.exports = {planExercise};