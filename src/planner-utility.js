const Parser = require("./parser");

/* Returns an array containing the available actions given the
current space and the knowledge base. */
function getAvailableActions(table, kb) {
	var actionList = kb.action_list;
	var result = [];
	for (var i = 0; i < actionList.length; i++) {
				
	}
}

/* Gets all the possible replacements of variables for an action, based on its parameter requirements and preconditions. */
function getAllPossibleActionVariableReplacements(action, table, kb) {
	var candidates = getAllPossibleParameterMatches(action, table, kb);
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
			testMatch[j] = testMatch[j].id;
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
			if (assertionIsTrue(testAssertion, kb) == false) {
				valid = false;
				break;
			}
		}
		
		if (valid) {
			res.push(testMatch);
		}
	}
	console.log(res);
	return res;
}

/* Checks if an assertion is true, given the assertions in the knowledge
base.  The format of the assertion parameter is as follows:
{ truth: <truth value>, predicate: <predicate>, parameters: <array of
strings> }
For the parameters, represent instances with their respective identifiers. */
function assertionIsTrue(assertion, kb) {
	var assertionList = kb.relationship_list;
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
				if (isExtendedFrom(currentQueryParameter, currentAssertionParameter, kb) == false) {
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
function getAllPossibleParameterMatches(action, table, kb) {
	var parameters = action.parameters;
	// For each parameter, identify all table elements that match the criteria
	var res = [];
	for (var i = 0; i < parameters.length; i++) {
		var typeRequirement = parameters[i];
		res.push([]);
		for (var j = 0; j < table.length; j++) {
			var type = table[j].type;
			if (typeRequirement == "*") { // wildcard
				res[i].push(table[j]);
			}
			else if (isExtendedFrom(type, typeRequirement, kb)) {
				res[i].push(table[j]);
			}
		}
	}
	return res;
}

/* Returns if a the given offspring is extended from a given
parent, based on the types defined in the knowledge base. */
function isExtendedFrom(offspring, parent, kb) {
	// Search for all ancestors of the given offspring using BFS
	var res = [];
	var stack = [];
	var temp = [].concat(kb.type_list);
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
	res = res.sort(function(a, b) {
		if (a[0] < b[0]) return -1;
		else if (a[0] > b[0]) return 1;
		return 0;
	});
	var index = fetchTypeIndex(res, parent);
	if (index != -1) {
		return true;
	}
	return false;
}

/* Initializes the memory table from the space list. The space
list is an array containing non-primitive type names. This
function returns a table which is needed for planner algorithm.
This function returns null if the space array is invalid. */
function initializeMemoryTable(space, kb) {
	var res = [];
	var identifierCounter = 1;
	for (var i = 0; i < space.length; i++) {
		var name = space[i];
		if (isPrimitive(name)) {
			return null;
		}
		var identifier = name + "" + identifierCounter;
		res.push({id: identifier, type: name, memory: []});
		addType(kb, [identifier, [name]]);
		identifierCounter++;
	}
	return res;
}

/* Checks if a type is primitive or not. A type is primitive if
its name ends with an asterisk symbol (*). */
function isPrimitive(type) {
	return type.charAt(type.length - 1) == '*';
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


module.exports = {addType, addAssertion, sortKnowledgeBase, isPrimitive, initializeMemoryTable, fetchTypeIndex, fetchActionIndex, isExtendedFrom, getAllPossibleParameterMatches, getAllPossibleActionVariableReplacements, assertionIsTrue};