const PlannerComponents = require("./planner-components");

function backwardStateSpaceSearch(existents, initial, goal, domain) {
	var actions = domain.actions;
	
	var stateStack = [goal];
	var actionStack = [[]];
	var visited = [goal];
	var plan = null;
	
	while (stateStack.length > 0) {
		var currentState = stateStack[stateStack.length - 1];
		var currentAction = actionStack[actionStack.length - 1];
		stateStack.splice(stateStack.length - 1, 1);
		actionStack.splice(actionStack.length - 1, 1);
		
		if (currentState.isSatisfiedBy(initial)) {
			plan = currentAction;
			break;
		}
		
		for (var i = 0; i < actions.length; i++) {
			var potentialAction = actions[i];
			var matchings = potentialAction.getParameterMatchings(existents);
			for (var j = 0; j < matchings.length; j++) {
				var newState = currentState.regress(potentialAction, matchings[j]);
				var found = false;
				for (var k = 0; k < visited.length; k++) {
					if (visited[k].isSameWith(newState)) {
						found = true;
						break;
					}
				}
				if (!found) {
					visited.push(newState);
					stateStack.push(newState);
					actionStack.push([].concat(currentAction).concat([{action: potentialAction, parameters: matchings[j]}]));
				}
			}
		}
	}
	
	return plan;
}

module.exports = {backwardStateSpaceSearch};