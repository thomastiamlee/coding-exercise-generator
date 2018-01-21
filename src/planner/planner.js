const PlannerComponents = require("./planner-components");

function selectTargetComputation(domain) {
	var logicActions = domain.logicActions;
	return logicActions[Math.floor(Math.random() * logicActions.length)];
}

function generateExistents(targetComputation, domain) {
	// This function will be changed later on, if time permits.
	var result = [];
	var existents = domain.existents;
	for (var i = 0; i < existents.length; i++) {
		var name = existents[i].name;
		for (var j = 0; j < 1; j++) {
			var newExistent = new PlannerComponents.existent(name + (j + 1));
			newExistent.parent = existents[i];
			result.push(newExistent);
		}
	}
	return result;
}

function getStoryGoals(targetComputation, existents) {
	var matchings = targetComputation.getParameterMatchings(existents);
	var result = [];
	while (matchings.length > 0) {
		var index = Math.floor(Math.random() * matchings.length);
		var matching = matchings[index];
		var truths = targetComputation.applyParametersToPreconditions(matching).concat(targetComputation.applyParametersToRequirements(matching));
		result.push(new PlannerComponents.state(truths));
		matchings.splice(index, 1);
	}
	return result;
}

function backwardStateSpaceSearchActions(existents, initial, goal, domain) {
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

function plan(domain) {
	var targetComputation = selectTargetComputation(domain);
	console.log("Target computation selected:");
	console.log(targetComputation);
	var existents = generateExistents(targetComputation, domain);
	console.log("Existents generated:");
	//console.log(existents);
	var goals = getStoryGoals(targetComputation, existents);
	console.log("Goals:");
	console.log(goals[0]);
}

module.exports = {plan};