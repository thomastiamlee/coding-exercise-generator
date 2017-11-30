const Parser = require("./parser");

/* Constructor for the memory table, which serves as the main mechanism for remembering
information during the planning process. */
function memory() {
	this.counter = 1;
	this.space = [];
	this.assertions = [];
	this.variables = [];
	
	/* Adds a new space entity in the memory. space can be a single string representing the
	type of the new space entity or it can be an array of strings representing multiple
	types. */
	this.addSpace = function(space) {
		if (space.constructor !== Array) {
			space = [space];
		}
		for (var i = 0; i < space.length; i++) {
			var id = space[i] + this.counter;
			this.space.push([id, [space[i]]]);
			this.counter = this.counter + 1;
		}
	}
	
	this.addAssertion = function(assertion) {
		console.log("ADDING:");
		console.log(assertion);
		var truth = assertion.truth;
		var assertionList = this.assertions;
		// Try to find if the assertion already exists
		var index = -1;
		for (var i = 0; i < assertionList.length; i++) {
			var predicate = assertionList[i].predicate;
			if (predicate == assertion.predicate) {
				var same = true;
				for (var j = 0; j < assertion.parameters.length; j++) {
					if (assertion.parameters[j] != assertionList[i].parameters[j]) {
						same = false;
						break;
					}
				}
				if (same) {
					index = i;
					break;
				}
			}
		}
		if (truth && index == -1) {
			delete assertion.truth;
			assertionList.push(assertion);
		}
		else if (!truth && index != -1) {
			assertionList.splice(index, 1);
		}
	}
}

/* Executes a given action with the given parameters. Updates the assertions in the knowledge base as a result of performing the action. */
function executeAction(kb, table, action, parameters) {
	var effectList = action.effects;
	for (var i = 0; i < effectList.length; i++) {
		var current = effectList[i];
		var truth = current.truth;
		var predicate = current.predicate;
		var currentParameters = [].concat(current.parameters);
		for (var j = 0; j < currentParameters.length; j++) {
			if (currentParameters[j].charAt(0) >= '0' && currentParameters[j].charAt(0) <= '9') {
				var index = parseInt(currentParameters[j]);
				currentParameters[j] = parameters[index];
			}
		}
		var newAssertion = {
			truth: truth,
			predicate: predicate,
			parameters: currentParameters
		}
		table.addAssertion(newAssertion);
	}
}

/* Returns an array containing the available actions given the
current space and the knowledge base. */
function getAvailableActions(kb, table) {
	var actionList = kb.action_list;
	var availableActions = [];
	for (var i = 0; i < actionList.length; i++) {
		var possible = getAllPossibleActionVariableReplacements(kb, table, actionList[i]);
		for (var j = 0; j < possible.length; j++) {
			availableActions.push({action: actionList[i], parameters: possible[j]});
		}
	}
	return availableActions;
}

/* Gets all the possible replacements of variables for an action, based on its parameter requirements and preconditions. */
function getAllPossibleActionVariableReplacements(kb, table, action) {
	var candidates = getAllPossibleParameterMatches(kb, table, action);
	var res = [];
	var combinations = 1;
	var preconditions = action.preconditions;
	for (var i = 0; i < candidates.length; i++) {
		combinations = combinations * candidates[i].length;
	}
	// Loop through all combinations
	for (var i = 0; i < combinations; i++) {
		var testMatch = [];
		var ccl = 1;
		// Build the parameter list
		for (var j = 0; j < candidates.length; j++) {
			var len = candidates[j].length;
			testMatch.push(candidates[j][Math.floor(i / ccl) % len]);
			ccl *= len;
		}
		// Loop through all preconditions
		var valid = true;
		for (var j = 0; j < preconditions.length; j++) {
			var params = preconditions[j].parameters;
			var newParams = [];
			for (var k = 0; k < params.length; k++) {
				if (params[k].charAt(0) >= '0' && params[k].charAt(0) <= '9') {
					// replace
					var index = parseInt(params[k]);
					newParams.push(testMatch[index]);
				}
				else {
					newParams.push(params[k]);
				}
			}
			var testAssertion = {
				truth: preconditions[j].truth,
				predicate: preconditions[j].predicate,
				parameters: newParams
			}
			if (assertionIsTrue(kb, table, testAssertion) == false) {
				valid = false;
				break;
			}
		}
		// Check for duplicates
		var seen = [];
		for (var j = 0; j < testMatch.length; j++) {
			if (seen.indexOf(testMatch[j]) != -1) {
				valid = false;
				break;
			}
			seen.push(testMatch[j]);
		}
		if (valid) {
			res.push(testMatch);
		}
	}
	return res;
}

/* Checks if an assertion is true, given the assertions in the knowledge
base.  The format of the assertion parameter is as follows:
{ truth: <truth value>, predicate: <predicate>, parameters: <array of
strings> }
For the parameters, represent instances with their respective identifiers. */
function assertionIsTrue(kb, table, assertion) {
	var assertionList = kb.relationship_list.concat(table.assertions);
	var queryPredicate = assertion.predicate;
	var queryParameters = assertion.parameters;
	for (var i = 0; i < assertionList.length; i++) {
		var currentAssertion = assertionList[i];
		var assertionPredicate = currentAssertion.predicate;
		var assertionParameters = currentAssertion.parameters;
		
		if (assertionPredicate == queryPredicate && assertionParameters.length == queryParameters.length) {
			// Check if each parameter matches
			var assumption = true;
			for (var j = 0; j < queryParameters.length; j++) {
				var currentQueryParameter = queryParameters[j];
				var currentAssertionParameter = assertionParameters[j];
				if (isExtendedFrom(kb, table, currentQueryParameter, currentAssertionParameter) == false) {
					assumption = false;
				}
			}
			if (assumption) {
				if (assertion.truth) return true; return false;
			}
		}
	}
	if (assertion.truth) return false; return true;
}

/* Gets all the possible combination of space elemets that can be assigned for an action, based on its parameter requirements and
preconditions. */
function getAllPossibleParameterMatches(kb, table, action) {
	var parameters = action.parameters;
	// For each parameter, identify all table elements that match the criteria
	var res = [];
	var candidates = table.space.concat(kb.primitive_list);
	for (var i = 0; i < parameters.length; i++) {
		var typeRequirement = parameters[i];
		res.push([]);
		for (var j = 0; j < candidates.length; j++) {
			var type = candidates[j][0];
			if (typeRequirement == "*") { // wildcard
				res[i].push(candidates[j][0]);
			}
			else if (isExtendedFrom(kb, table, type, typeRequirement)) {
				res[i].push(candidates[j][0]);
			}
		}
	}
	return res;
}

/* Returns if a the given offspring is extended from a given
parent, based on the types defined in the knowledge base. */
function isExtendedFrom(kb, table, offspring, parent) {
	// Search for all ancestors of the given offspring using BFS
	var res = [];
	var stack = [];
	var temp = [].concat(kb.type_list).concat(table.space);
	sortTypeList(temp);
	var offspringIndex = fetchTypeIndex(temp, offspring);
	if (offspringIndex == -1) {
		return false;
	}
	stack.push(temp[offspringIndex]);
	temp.splice(offspringIndex, 1);
	while (stack.length != 0) {
		var top = stack[0];
		res.push(top);
		stack.splice(0, 1);
		var extendedFrom = top[1];
		for (var i = 0; i < extendedFrom.length; i++) {
			var index = fetchTypeIndex(temp, extendedFrom[i]);
			stack.push(temp[index]);
			temp.splice(index, 1);
		}
	}
	sortTypeList(res);
	var index = fetchTypeIndex(res, parent);
	if (index != -1) {
		return true;
	}
	return false;
}

function sortTypeList(list) {
	list.sort(function(a, b) {
		if (a[0] < b[0]) return -1;
		else if (a[0] > b[0]) return 1;
		return 0;
	});
}

/* Fetches index of a type from the knowledge base, given its
name. This function assumes that the type list is sorted
lexicographically. This function returns -1 if the type is
not found. */
function fetchTypeIndex(typeList, name) {
	// Binary search
	var low = 0;
	var hi = typeList.length - 1;
	
	while (low <= hi) {
		var mid = Math.floor((low + hi) / 2);
		if (typeList[mid][0] == name) {
			return mid;
		}
		else if (typeList[mid][0] < name) {
			low = mid + 1;
		}
		else {
			hi = mid - 1;
		}
	}
	return -1;
}

/* Fetches index of an action from the knowledge base, given its
name. This function assumes that the action list is sorted
lexicographically. This function returns -1 if the type is
not found. */
function fetchActionIndex(actionList, name) {
	// Binary search
	var low = 0;
	var hi = actionList.length - 1;
	
	while (low <= hi) {
		var mid = Math.floor((low + hi) / 2);
		if (actionList[mid].name == name) {
			return mid;
		}
		else if (actionList[mid].name < name) {
			low = mid + 1;
		}
		else {
			hi = mid - 1;
		}
	}
	return -1;
}

function addType(kb, type) {
	kb.type_list.push(type);
	sortKnowledgeBase(kb);
}

/* This function adds a new assertion in the knowledge base. The format
of the assertion is as follows:
{ truth: <truth value>, predicate: <predicate>, parameters: <array of
strings> }
For the parameters, use the identifier for instances. */
function addAssertion(kb, assertion) {
	var truth = assertion.truth;
	var relationshipList = kb.relationship_list;
	// Try to find if the assertion already exists
	var index = -1;
	for (var i = 0; i < relationshipList.length; i++) {
		var predicate = relationshipList[i].predicate;
		if (predicate == assertion.predicate) {
			var same = true;
			for (var j = 0; j < assertion.parameters.length; j++) {
				if (assertion.parameters[j] != relationshipList[i].parameters[j]) {
					same = false;
					break;
				}
			}
			if (same) {
				index = i;
				break;
			}
		}
	}
	if (truth && index == -1) {
		relationshipList.push(assertion);
	}
	else if (!truth && index != -1) {
		relationshipList.splice(index, 1);
	}
}


/* This function sorts the knowledge base's types and actions
lexicographically. */
function sortKnowledgeBase(kb) {
	// Sort types and action lists
	kb.type_list = kb.type_list.sort(function(a, b) {
		if (a[0] < b[0]) return -1;
		else if (a[0] > b[0]) return 1;
		return 0;
	});
	kb.action_list = kb.action_list.sort(function(a, b) {
		if (a.name < b.name) return -1;
		else if (a.name > b.name) return 1;
		return 0;
	});
}


module.exports = {memory, addType, addAssertion, sortKnowledgeBase, fetchTypeIndex, fetchActionIndex, isExtendedFrom, getAllPossibleParameterMatches, getAllPossibleActionVariableReplacements, assertionIsTrue, getAvailableActions, executeAction};