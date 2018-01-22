const PlannerComponents = require("./planner-components");
const PLANNER_DEPTH_LIMIT = 6;

function plan(domain) {
	function log(str) {
		console.log(str);
	}
	function shuffle(arr) {
		var res = [];
		arr = [].concat(arr);
		while (arr.length > 0) {
			var index = Math.floor(Math.random() * arr.length)
			res.push(arr[index]);
			arr.splice(index, 1);
		}
		return res;
	}
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
			if (existents[i].type == "atom" || existents[i].type == "multiple") {
				var newExistent = new PlannerComponents.existent(name + "_instance");
				newExistent.parent = existents[i];
				result.push(newExistent);
			}			
		}
		return result;
	}
	function generateInitialState(existents) {
		var assertions = domain.assertions;
		var buildAssertions = domain.buildAssertions;
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
		var counter = 1;
		var toBeAdded = [];
		for (var i = 0; i < existents.length; i++) {
			for (var j = 0; j < buildAssertions.length; j++) {
				var parent = buildAssertions[j].parent;
				if (existents[i].isExtendedFrom(parent)) {
					var buildParameters = buildAssertions[j].buildParameters;
					var added = [];
					var newAssertions = buildAssertions[j].buildAssertions;
					for (var k = 0; k < buildParameters.length; k++) {
						var type = buildParameters[k].type;
						var newExistent = new PlannerComponents.existent(type.name + (counter++));
						newExistent.parent = type;
						added.push(newExistent);
					}
					for (var k = 0; k < newAssertions.length; k++) {
						var predicate = newAssertions[k].predicate;
						var current = [];
						for (var m = 0; m < newAssertions[k].parameters.length; m++) {
							var symbol = newAssertions[k].parameters[m];
							if (symbol == "_") {
								current.push(existents[i]);
							}
							else {
								for (var n = 0; n < added.length; n++) {
									if (buildParameters[n].symbol == symbol) {
										current.push(added[n]);
										break;
									}
								}
							}
						}
						var query = new PlannerComponents.query(true, predicate, current);
						result.push(query);
					}
					toBeAdded = toBeAdded.concat(added);
				}
			}
		}
		for (var i = 0; i < toBeAdded.length; i++) {
			existents.push(toBeAdded[i]);
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
			if (currentAction.length > 0)
			stateStack.splice(stateStack.length - 1, 1);
			actionStack.splice(actionStack.length - 1, 1);
			
			if (currentState.isSatisfiedBy(initial)) {
				plan = currentAction;
				break;
			}
			
			if (currentAction.length >= PLANNER_DEPTH_LIMIT) {
				continue;
			}
			
			var shuffled = shuffle(actions);
			for (var i = 0; i < shuffled.length; i++) {
				var potentialAction = shuffled[i];
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
		var actionStack = [[{action: targetAction, parameters: parameters}]];
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
			
			var shuffled = shuffle(actions);
			for (var i = 0; i < shuffled.length; i++) {
				var potentialAction = shuffled[i];
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
	function setAliasesAndValues(actionPlan, logicPlan) {
		var allPossibleInputs = [];
		for (var i = 0; i < logicPlan.plan.length; i++) {
			allPossibleInputs = allPossibleInputs.concat(logicPlan.plan[i].parameters);
		}
		var currentInputParameterCounter = "A".charCodeAt(0);
		for (var i = actionPlan.length - 1; i >= 0; i--) {
			var current = actionPlan[i].action;
			var aliases = current.aliases;
			var actionParameters = actionPlan[i].action.parameters;
			var realParameters = actionPlan[i].parameters;
			for (var j = 0; j < aliases.length; j++) {
				var symbol = aliases[j].symbol;
				var reference = aliases[j].reference;
				var type = reference.type;
				if (aliases[j].type == "alias") {	
					if (type == "reference") {
						var replacement = domain.getConstraintByName(reference.val).getRandomValue();
					}
					else if (type == "text") {
						var replacement = reference.val;
					}
					for (var k = 0; k < actionParameters.length; k++) {
						var previous = "";
						while (previous != replacement) {
							previous = replacement;
							replacement = replacement.replace("(" + actionParameters[k].symbol + ")", realParameters[k].getAlias());
						}
					}
					for (var k = 0; k < actionParameters.length; k++) {
						if (actionParameters[k].symbol == symbol) {
							realParameters[k].alias = replacement;
							break;
						}
					}
				}
				else if (aliases[j].type == "value") {
					var target = domain.getConstraintByName(reference.val);
					for (var k = 0; k < actionParameters.length; k++) {
						if (actionParameters[k].symbol == symbol) {
							realParameters[k].dataType = target.dataType;
							if (allPossibleInputs.indexOf(realParameters[k]) != -1) {
								realParameters[k].isInput = true;
								realParameters[k].logicalValue = String.fromCharCode(currentInputParameterCounter++);
							}
							else {
								realParameters[k].isInput = false;
								realParameters[k].logicalValue = target.getRandomValue();
							}
							break;
						}
					}
				}
			}
		}
	}
	log("Choosing target action...");
	var targetAction = selectTargetLogicAction();
	log("Chosen: " + targetAction.name);
	var existents = generateExistents();
	var initial = generateInitialState(existents);
	var matchings = targetAction.getParameterMatchings(existents);
	matchings = shuffle(matchings);
	var actionPlan = null; var logicPlan = null;	
	for (var i = 0; i < matchings.length && (actionPlan == null || logicPlan == null); i++) {
		actionPlan = null; logicPlan = null;
		var parameters = matchings[i];
		var logicPlan = backwardStateSpaceSearchLogic(existents, targetAction, parameters, 1);
		if (logicPlan == null) continue;
		var goal = logicPlan.state;
		var actionPlan = backwardStateSpaceSearchActions(existents, initial, goal);
	}
	if (logicPlan == null) {
		console.log("Generation failed.");
		return false;
	}
	if (actionPlan == null) {
		console.log("Generation failed.");
		return false;
	}
	setAliasesAndValues(actionPlan, logicPlan);
	
	return {actionPlan: actionPlan, logicPlan: logicPlan};
}

module.exports = {plan};