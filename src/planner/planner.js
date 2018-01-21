const PlannerComponents = require("./planner-components");

function plan(domain) {
	function selectTargetLogicAction() {
		var logicActions = domain.logicActions;
		return logicActions[Math.floor(Math.random() * logicActions.length)];
	}
	function generateExistents() {
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
	function generateInitialState(existents) {
		var assertions = domain.assertions;
		var result = [];
		for (var i = 0; i < assertions.length; i++) {
			var predicate = assertions[i].predicate;
			var matchings = assertions[i].getParameterMatchings(existents);
			for (var j = 0; j < matchings.length; j++) {
				var current = matchings[j];
				var query = new PlannerComponents.query(true, predicate, current);
				result.push(query);
			}
		}
		return new PlannerComponents.state(result);
	}
	function backwardStateSpaceSearchActions(existents, initial, goal) {
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
					if (newState == null) continue;
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
	function backwardStateSpaceSearchLogic(existents, targetAction, parameters, steps) {
		function unionWithRequirements(state) {
			var newTruths = state.truths;
			var requirements = targetAction.applyParametersToRequirements(parameters);
			for (var i = 0; i < requirements.length; i++) {
				var found = false;
				for (var j = 0; j < newTruths.length; j++) {
					if (newTruths[j].isSameWith(requirements[i])) {
						found = true;
						break;
					}
					else if (newTruths[j].isOppositeWith(requirements[i])) {
						return null;
					}
				}
				if (!found) newTruths.push(requirements[i]);
			}
			return new PlannerComponents.state(newTruths);
		}
		
		var targetState = new PlannerComponents.state(targetAction.applyParametersToPreconditions(parameters));
		var actions = domain.logicActions;
		var stateStack = [targetState];
		var actionStack = [[targetAction]];
		var stepStack = [1];
		var visited = [];
		
		var state = null;
		var plan = null;
		while (actionStack.length > 0) {
			var currentState = stateStack[stateStack.length - 1];
			var currentAction = actionStack[actionStack.length - 1];
			var currentStep = stepStack[stepStack.length - 1];
			stateStack.splice(stateStack.length - 1, 1);
			actionStack.splice(actionStack.length - 1, 1);
			stepStack.splice(stepStack.length - 1, 1);
			
			if (currentStep == steps) {
				var result = unionWithRequirements(currentState);
				if (result != null) {
					plan = currentAction;
					state = result;
				}
				break;
			}
			
			for (var i = 0; i < actions.length; i++) {
				var potentialAction = actions[i];
				var matchings = potentialAction.getParameterMatchings(existents);
				for (var j = 0; j < matchings.length; j++) {
					var newState = currentState.regress(potentialAction, matchings[j]);
					if (newState == null) continue;
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
						stepStack.push(currentStep + 1);
					}
				}
			}
		}
		
		return { state: state, plan: plan };
	}
	function setAliases(actionPlan) {
		for (var i = actionPlan.length - 1; i >= 0; i--) {
			var current = actionPlan[i].action;
			var aliases = current.aliases;
			var actionParameters = actionPlan[i].action.parameters;
			var realParameters = actionPlan[i].parameters;
			for (var j = 0; j < aliases.length; j++) {
				var symbol = aliases[j].symbol;
				var reference = aliases[j].reference;
				var type = reference.type;
				if (type == "reference") {
					var replacement = domain.getConstraintByName(reference.val).getRandomValue();
				}
				else if (type == "text") {
					var replacement = reference.val;
				}
				for (var k = 0; k < actionParameters.length; k++) {
					if (actionParameters[k].symbol == symbol) {
						realParameters[k].alias = replacement;
						break;
					}
				}
			}
		}
	}
	
	var targetAction = selectTargetLogicAction();
	var existents = generateExistents();
	var matchings = targetAction.getParameterMatchings(existents);
	var parameters = matchings[1];
	var logicPlan = backwardStateSpaceSearchLogic(existents, targetAction, parameters, 1);
	var goal = logicPlan.state;
	var initial = generateInitialState(existents);
	var actionPlan = backwardStateSpaceSearchActions(existents, initial, goal);
	setAliases(actionPlan);
	
	return {actionPlan: actionPlan, logicPlan: logicPlan};
}

module.exports = {plan};