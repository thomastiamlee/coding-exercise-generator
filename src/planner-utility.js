/* Returns an array containing the available actions given the
current space and the knowledge base. */
function getAvailableActions(table, kb) {
	var actionList = kb.action_list;
	var result = [];
	for (var i = 0; i < actionList.length; i++) {
				
	}
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

module.exports = {isPrimitive, initializeMemoryTable};