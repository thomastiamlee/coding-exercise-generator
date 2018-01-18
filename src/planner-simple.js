const Parser = require("./parser");
const PlannerUtility = require("./planner-utility");

/* Attempts to plan an exercise, given the initial space.
The space is an array containing non-primitive type names
that will serve as possible elements in the story. */
function planExercise(kb, table) {
	var actionList = [];
	var localEntities = table.getLocalEntity();
	while (true) {
		var choices = PlannerUtility.getAvailableActions(kb, table);
		if (choices.length == 0) {
			//break;
		}
		var chosen = choices[Math.floor(Math.random() * choices.length)];
		actionList.push(chosen);
		var res = chosen.action.name;
		for (var i = 0; i < chosen.parameters.length; i++) {
			res += " " + chosen.parameters[i].name;
		}
		console.log(res);
		PlannerUtility.executeAction(kb, table, chosen);
		if (PlannerUtility.isComputedAction(chosen.action) && Math.random() > 0.5) {
			//break;
		}
		if (chosen.action.name == "convertcelsiustofahrenheit") break;
	}
	while (actionList.length > 0 && PlannerUtility.isComputedAction(actionList[actionList.length - 1].action) == false) {
		actionList.splice(actionList.length - 1, 1);
	}
	
	var current = 0;
		
	while (current < actionList.length - 1) {
		// Initialize data structures
		var table = new PlannerUtility.memory();
		var space = [].concat(localEntities);
		// Execute all actions before the current action
		for (var i = 0; i < current; i++) {
			var currentAction = actionList[i].action;
			space = space.concat(actionList[i].createParameters);
			var effectList = currentAction.effects;
			for (var j = 0; j < effectList.length; j++) {
				var truth = effectList[j].truth;
				var predicate = effectList[j].predicate;
				var parameters = [].concat(effectList[j].parameters);
				for (var k = 0; k < parameters.length; k++) {
					parameters[k] = PlannerUtility.replaceSymbolicParameters(actionList[i].parameters, actionList[i].createParameters, parameters[k]);
				}
				var newAssertion = new PlannerUtility.assertionQuery(truth, predicate, parameters);
				table.assert(newAssertion);
			}
		}
		
		// Skip the current action, and check if future actions can be executed
		var remove = [current];
		for (var i = current + 1; i < actionList.length; i++) {
			// Test if all parameters of current action are available
			var valid = true;
			var parameters = actionList[i].parameters;
			for (var j = 0; j < parameters.length; j++) {
				if (space.indexOf(parameters[j]) == -1) {
					valid = false;
					break;
				}
			}
			if (!valid) {
				remove.push(i);
				continue;
			}
			// Test if all preconditions are true
			var preconditions = actionList[i].action.preconditions;
			for (var j = 0; j < preconditions.length; j++) {
				var truth = preconditions[j].truth;
				var predicate = preconditions[j].predicate;
				var parameters = [].concat(preconditions[j].parameters);
				for (var k = 0; k < parameters.length; k++) {
					parameters[k] = PlannerUtility.replaceSymbolicParameters(actionList[i].parameters, actionList[i].createParameters, parameters[k]);
				}
				var newAssertion = new PlannerUtility.assertionQuery(truth, predicate, parameters);
				if (PlannerUtility.checkAssertion(kb, table, newAssertion) == false) {
					valid = false;
					break;
				}
			}
			if (!valid) {
				remove.push(i);
				continue;
			}
			// Execute the action
			var currentAction = actionList[i].action;
			space = space.concat(actionList[i].createParameters);
			var effectList = currentAction.effects;
			for (var j = 0; j < effectList.length; j++) {
				var truth = effectList[j].truth;
				var predicate = effectList[j].predicate;
				var parameters = [].concat(effectList[j].parameters);
				for (var k = 0; k < parameters.length; k++) {
					parameters[k] = PlannerUtility.replaceSymbolicParameters(actionList[i].parameters, actionList[i].createParameters, parameters[k]);
				}
				var newAssertion = new PlannerUtility.assertionQuery(truth, predicate, parameters);
				table.assert(newAssertion);
			}
		}

		if (remove.indexOf(actionList.length - 1) == -1) {
			for (var i = actionList.length - 1; i >= 0; i--) {
				if (remove.indexOf(i) != -1) {
					actionList.splice(i, 1);
				}
			}			
		}
		else {
			current++;
		}
	}
	
	return actionList;
}


module.exports = {planExercise};