/* Returns an array containing the available actions given the
current space and the knowledge base. */
function getAvailableActions(table, kb) {
	var actionList = kb.action_list;
	var result = [];
	for (var i = 0; i < actionList.length; i++) {
				
	}
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

/* This function performs the necessary initializations to the
knowledge base in preparation for the planning algorithm. */
function initializeKnowledgeBase(kb) {
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
		res.push({id: name + "" + identifierCounter, type: name, memory: []});
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

module.exports = {isPrimitive, initializeMemoryTable, initializeKnowledgeBase, fetchTypeIndex, fetchActionIndex, isExtendedFrom, getAllPossibleParameterMatches};