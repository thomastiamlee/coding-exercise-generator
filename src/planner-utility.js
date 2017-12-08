const Parser = require("./parser");
const Clone = require("clone");

/* Constructor for a space entity. name is the unique identifier for this space entity. parents is an
array containing the list of strings representing the names of the parents of this entity. type is either
"local" or "global", representing if this entity exists in the global (knowledge base) or local space (memory).
If the entity is of a global type, a fourth parameter (which defaults to true) determines if it can be
instantiated on the local space or not. */
function entity(name, parents, type, instantiatable = true) {
	this.name = name;
	this.parents = parents;
	this.type = type;

	if (this.type == "global") {
		this.instantiatable = instantiatable;
	}
	else if (this.type == "local") {
		this.attachments = [];
		this.dataType = null;
		this.value = null;
		this.attachLocalEntity = function(other, name) {
			if (other.type == "local") {
				var found = false;
				for (var i = 0; i < this.attachments.length; i++) {
					if (this.attachments[i].name == name) {
						this.attachments[i].obj = other;
						found = true;
						break;
					}
				}
				if (!found) {
					this.attachments.push({name: name, obj: other});
				}
			}
		}
		this.getAttachedLocalEntity = function(name) {
			for (var i = 0; i < this.attachments.length; i++) {
				if (this.attachments[i].name == name) {
					return this.attachments[i].obj;
				}
			}
			return null;
		}
		this.removeAttachedLocalEntity = function(name) {
			for (var i = 0; i < this.attachments.length; i++) {
				if (this.attachments[i].name == name) {
					this.attachments.splice(i, 1);
					break;
				}
			}
		}
	}
	this.isExtendedFrom = function(parent) {
		var stack = [];
		var visited = [];
		stack.push(this);
		visited.push(this);
		while (stack.length > 0) {
			var current = stack[0];
			stack.splice(0, 1);
			var parents = current.parents;
			for (var i = 0; i < parents.length; i++) {
				if (visited.indexOf(parents[i]) == -1) {
					visited.push(parents[i]);
					stack.push(parents[i]);
				}
			}
		}
		return visited.indexOf(parent) != -1;
	}
}

/* Constructor for an assertion. predicate is a string representing the predicate name. parameters is an
array of entity objects that represent the parameters to this assertion. */
function assertion(predicate, parameters) {
	this.predicate = predicate;
	this.parameters = parameters;
}

function assertionQuery(truth, predicate, parameters) {
	this.truth = truth;
	this.predicate = predicate;
	this.parameters = parameters;
}


/* Constructor for the knowledge base. */
function knowledgeBase() {
	this.globalEntities = [];
	this.globalStaticEntities = [];
	this.globalAssertions = [];
	this.actions = [];

	this.getGlobalEntity = function(name) {
		return this.globalEntities[name];
	}

	this.getGlobalAssertions = function(name) {
		if (name) {
			return this.globalAssertions[name];
		}
		else {
			var result = [];
			for (var prop in this.globalAssertions) {
				result = result.concat(this.globalAssertions[prop]);
			}
			return result;
		}
	}
}

/* Constructor for the memory table, which serves as the main mechanism for remembering
information during the planning process. */
function memory() {
	this.counter = 1;
	this.space = [];
	this.assertions = [];
	this.localEntities = [];

	/* Creates a new local entity from a global entity and adds it to memory. The name is automatically
	assigned to ensure that there are no duplicates. */
	this.createLocalEntity = function(globalEntities) {
		if (globalEntities instanceof Array == false) {
			globalEntities = [globalEntities];
		}
		for (var i = 0; i < globalEntities.length; i++) {
			var globalEntity = globalEntities[i];
			if (globalEntity.instantiatable) {
				var ctr = 1;
				var success = false;
				var name = globalEntity.name + ctr;
				while (this.getLocalEntity(name) != null) {
					ctr++;
					name = globalEntity.name + ctr;
				}
				var newEntity = new entity(name, [globalEntity], "local");
				this.localEntities[name] = newEntity;
			}
		}
	}

	this.getLocalEntity = function(name) {
		if (name) {
			return this.localEntities[name];
		}
		else {
			var res = [];
			for (var prop in this.localEntities) {
				res.push(this.localEntities[prop]);
			}
			return res;
		}
	}

	this.getAssertions = function(name) {
		if (name) {
			return this.assertions[name];
		}
		else {
			var res = [];
			for (var prop in this.assertions) {
				res = res.concat(this.assertions[prop]);
			}
			return res;
		}
	}

	this.assert = function(assertionQuery) {
		var truth = assertion.truth;
		var predicate = assertion.predicate;
		var parameters = assertion.parameters;

		if (this.assertions[predicate]) {
			var list = this.assertions[predicate];
			if (!truth) {
				for (var i = 0; i < list.length; i++) {
					var current = list[i].parameters;
					var valid = true;
					for (var j = 0; j < current.length; j++) {
						if (current[j].isExtendedFrom(parameters[j]) == false) {
							valid = false;
							break;
						}
					}
					if (valid) {
						list.splice(i, 1);
						i--;
					}
				}
			}
			if (truth) {
				var found = false;
				for (var i = 0; i < list.length; i++) {
					var current = list[i].parameters;
					var same = true;
					for (var j = 0; j < current.length; j++) {
						if (current[j] != parameters[j]) {
							same = false;
						}
					}
					if (same) {
						found = true;
						break;
					}
				}
				if (!found) {
					list.push(new assertion(predicate, parameters));
				}
			}
		}
		else if (truth) {
			this.assertions[predicate] = [new assertion(predicate, parameters)];
		}
	}

	/*
	this.cloneMemory = function() {
		return Clone(this);
	}

	this.isEquivalent = function(o) {
		function assertionSort(a, b) {
			if (a.predicate != b.predicate) {
				return a.predicate < b.predicate ? -1 : 1;
			}
			else if (a.truth != b.truth) {
				return a.truth ? -1 : 1;
			}
			else {
				var aStr = a.parameters.join(",");
				var bStr = b.parameters.join(",");
				return aStr < bStr ? -1 : 1;
			}
		}

		function spaceSort(a, b) {
			return a[0] < b[0] ? -1 : 1;
		}

		var space = Clone(this.space);
		var oSpace = Clone(o.space);
		space.sort(spaceSort);
		oSpace.sort(spaceSort);

		var assertions = Clone(this.assertions);
		var oAssertions = Clone(o.assertions);
		assertions.sort(assertionSort);
		oAssertions.sort(assertionSort);

		space = JSON.stringify(space);
		oSpace = JSON.stringify(oSpace);
		assertions = JSON.stringify(assertions);
		oAssertions = JSON.stringify(oAssertions);

		return space == oSpace && assertions == oAssertions;
	}
	*/
}

function checkAssertion(kb, table, assertionQuery) {
	var truth = assertionQuery.truth;
	var predicate = assertionQuery.predicate;
	var parameters = assertionQuery.parameters;

	//var assertionList = kb.getGlobalAssertions(predicate).concat(table.);
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


/* Executes a given action with the given parameters. Updates the assertions in the knowledge base as a result of performing the action. */
function executeAction(kb, table, action, parameters) {
	var effectList = action.effects;
	for (var i = 0; i < effectList.length; i++) {
		var current = effectList[i];
		var truth = current.truth;
		var predicate = current.predicate;
		var currentParameters = [].concat(current.parameters);
		for (var j = 0; j < currentParameters.length; j++) {
			currentParameters[j] = replaceParameterName(parameters, currentParameters[j]);
		}
		var newAssertion = {
			truth: truth,
			predicate: predicate,
			parameters: currentParameters
		}
		table.addAssertion(newAssertion);
	}
	var createList = action.creates;
	for (var i = 0; i < createList.length; i++) {
		var owner = createList[i].owner;
		if (owner.charAt(0) >= '0' && owner.charAt(0) <= '9') {
			var index = parseInt(owner);
			table.addSpace(createList[i].parent, parameters[index]);
		}
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
				var name = replaceParameterName(testMatch, params[k]);
				newParams.push(name);
				/*
				if (params[k].charAt(0) >= '0' && params[k].charAt(0) <= '9') {
					// replace
					var index = parseInt(params[k]);
					newParams.push(testMatch[index]);
				}
				else {
					newParams.push(params[k]);
				}*/
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

/* This function converts a symbol used in an assertion list to the actual
variable name. */
function replaceParameterName(parameters, symbol) {
	if (symbol.owner) {
		var index = parseInt(symbol.owner);
		return parameters[index] + "." + symbol.parent;
	}
	else if (symbol.charAt(0) >= '0' && symbol.charAt(0) <= '9') {
		var index = parseInt(symbol);
		return parameters[index];
	}
	return symbol;
}


module.exports = {memory, entity, assertion, assertionQuery, knowledgeBase, addType, addAssertion, sortKnowledgeBase, fetchTypeIndex, fetchActionIndex, getAllPossibleParameterMatches, getAllPossibleActionVariableReplacements, getAvailableActions, executeAction};;
