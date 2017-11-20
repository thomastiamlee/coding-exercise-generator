/* Returns an array containing the available actions given the
current space and the knowledge base. */
function getAvailableActions(table, kb) {
	var actionList = kb.action_list;
	var result = [];
	for (var i = 0; i < actionList.length; i++) {
				
	}
}

/* Returns if a the given offspring is extended from a given
parent, based on the types defined in the knowledge base. */
function isExtendedFrom(offspring, parent, kb) {
	// Search for all ancestors of the given offspring using BFS
	var stack = [];
	var temp = [].concat(typeList);
	var offspringType = fetchType(kb, offspring);
	stack.push(offspringType);
	
	while (stack.length != 0) {
		
	}
}

/* This function performs the necessary initailizations to the
knowledge base in preparation for the planning algorithm. */
function initializeKnowledgeBase(kb) {
	// Sort types and action lists
	kb.type_list = kb.type_list.sort(function(a, b) {
		if (a[0] < b[0]) {
			return -1;
		}
		else if (a[0] > b[0]) {
			return 1;
		}
		return 0;
	});
	kb.action_list = kb.action_list.sort(function(a, b) {
		if (a.name < b.name) {
			return -1;
		}
		else if (a.name > b.name) {
			return 1;
		}
		return 0;
	});
}

/* Initializes the memory table from the space list. The space
list is an array containing non-primitive type names. This
function returns a table which is needed for planner algorithm.
This function returns null if the space array is invalid. */
function initializeMemoryTable(space, kb) {
	var res = [];
	for (var i = 0; i < space.length; i++) {
		var name = space[i];
		if (isPrimitive(name)) {
			return null;
		}
		res.push({type: name, memory: []});
	}
	return res;
}

/* Checks if a type is primitive or not. A type is primitive if
its name ends with an asterisk symbol (*). */
function isPrimitive(type) {
	return type.charAt(type.length - 1) == '*';
}

/* Fetches index of a type from the knowledge base, given its
name. This function assumes that the knowledge base has been
initialized already. */
function fetchTypeIndex(typeList, name) {
	// Binary search
	var low = 0;
	var hi = typeList.length - 1;
	
	while (low <= hi) {
		var mid = Math.floor((low + hi) / 2);
		console.log("mid: " + mid);
		if (typeList[mid][0] == name) {
			return mid;
		}
		else if (typeList[mid][0] < name) {
			low = mid + 1;
		}
		else if (typeList[mid][0] > name) {
			hi = mid - 1;
		}
	}
	return null;
}

module.exports = {isPrimitive, initializeMemoryTable, initializeKnowledgeBase, fetchTypeIndex};