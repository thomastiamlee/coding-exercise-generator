const Parser = require("./parser");
const Clone = require("clone");

function wildcardToken() {}

function placeholderToken(index) {
	this.index = index;
}

function createPlaceholderToken(index) {
	this.index = index;
}

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
		this.attachLocalEntity = function(other) {
			if (other.type == "local") {
				var found = false;
				for (var i = 0; i < this.attachments.length; i++) {
					if (this.attachments[i] == other) {
						this.attachments[i] = other;
						found = true;
						break;
					}
				}
				if (!found) {
					this.attachments.push(other);
				}
			}
		}
		this.getAttachedLocalEntities = function() {
			return this.attachments;
		}
		this.removeAttachedLocalEntity = function(other) {
			for (var i = 0; i < this.attachments.length; i++) {
				if (this.attachments[i] == other) {
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
		if (name) {
			return this.globalEntities[name];
		}
		else {
			var res = []
			for (var prop in this.globalEntities) {
				res.push(this.globalEntities[prop]);
			}
			return res;
		}
	}

	this.getGlobalStaticEntity = function(name) {
		if (name) {
			return this.globalStaticEntities[name];
		}
		else {
			var res = []
			for (var prop in this.globalStaticEntities) {
				res.push(this.globalStaticEntities[prop]);
			}
			return res;
		}
	}

	this.getGlobalAssertions = function(name) {
		if (name) {
			return this.globalAssertions[name] ? this.globalAssertions[name] : [];
		}
		else {
			var result = [];
			for (var prop in this.globalAssertions) {
				result = result.concat(this.globalAssertions[prop]);
			}
			return result;
		}
	}

	this.getAction = function(name, variant = 0) {
		if (name) {
			return this.actions[name][variant];
		}
		else {
			var res = [];
			for (var prop in this.actions) {
				res = res.concat(this.actions[prop]);
			}
			return res;
		}
	}
}

/* Constructor for the memory table, which serves as the main mechanism for remembering
information during the planning process. */
function memory() {
	this.counter = 1;
	this.assertions = [];
	this.localEntities = [];

	/* Creates a new local entity from a global entity and adds it to memory. The name is automatically
	assigned to ensure that there are no duplicates. */
	this.createLocalEntity = function(globalEntities) {
		var res = [];
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
				res.push(newEntity);
			}
		}
		return res;
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
			return this.assertions[name] ? this.assertions[name] : [];
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
		var truth = assertionQuery.truth;
		var predicate = assertionQuery.predicate;
		var parameters = assertionQuery.parameters;

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
				if (list.length == 0) {
					delete this.assertions[predicate];
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
}

function checkAssertion(kb, table, assertionQuery) {
	var truth = assertionQuery.truth;
	var predicate = assertionQuery.predicate;
	var parameters = assertionQuery.parameters;
	var assertionList = kb.getGlobalAssertions(predicate).concat(table.getAssertions(predicate));
	for (var i = 0; i < assertionList.length; i++) {
		var currentAssertion = assertionList[i];
		var assertionParameters = currentAssertion.parameters;
		if (assertionParameters.length == parameters.length) {
			var assumption = true;
			for (var j = 0; j < parameters.length; j++) {
				if (parameters[j].isExtendedFrom(assertionParameters[j]) == false) {
					assumption = false;
					break;
				}
			}
			if (assumption) {
				return truth;
			}
		}
	}
	return !truth;
}

function getAllPossibleParameterMatches(kb, table, action) {
	var parameters = action.parameters;
	var res = [];
	var candidates = table.getLocalEntity().concat(kb.getGlobalStaticEntity());
	for (var i = 0; i < parameters.length; i++) {
		var requirement = parameters[i];
		res.push([]);
		for (var j = 0; j < candidates.length; j++) {
			if (requirement instanceof wildcardToken) { // wildcard
				res[i].push(candidates[j]);
			}
			else if (candidates[j].isExtendedFrom(requirement)) {
				res[i].push(candidates[j]);
			}
		}
	}
	return res;
}

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
				newParams.push(replaceSymbolicParameters(testMatch, [], params[k]));
			}
			var testAssertion = new assertionQuery(preconditions[j].truth, preconditions[j].predicate, newParams);


			if (checkAssertion(kb, table, testAssertion) == false) {
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

function getAvailableActions(kb, table) {
	var actionList = kb.getAction();
	var availableActions = [];
	for (var i = 0; i < actionList.length; i++) {
		var possible = getAllPossibleActionVariableReplacements(kb, table, actionList[i]);
		for (var j = 0; j < possible.length; j++) {
			availableActions.push({action: actionList[i], parameters: possible[j]});
		}
	}
	return availableActions;
}

function executeAction(kb, table, actionInformation) {
	var action = actionInformation.action;
	var parameters = actionInformation.parameters;
	var effectList = action.effects;
	var createList = action.creates;
	var createParameters = [];
	for (var i = 0; i < createList.length; i++) {
		var parent = createList[i].parent;
		var res = table.createLocalEntity(parent);
		if (createList[i].owner) {
			var owner = parameters[createList[i].owner.index];
			owner.attachLocalEntity(res[0]);
		}
		createParameters.push(res[0]);
	}
	for (var i = 0; i < effectList.length; i++) {
		var current = effectList[i];
		var truth = current.truth;
		var predicate = current.predicate;
		var currentParameters = [].concat(current.parameters);
		for (var j = 0; j < currentParameters.length; j++) {
			currentParameters[j] = replaceSymbolicParameters(parameters, createParameters, currentParameters[j]);
		}
		var newAssertion = new assertionQuery(truth, predicate, currentParameters);
		table.assert(newAssertion);
	}
	actionInformation.createParameters = createParameters;
}

function isComputedAction(action) {
	return action.isComputed;
}

/* This function converts a symbol used in an assertion list to the actual
variable name. */
function replaceSymbolicParameters(parameters, createParameters, symbol) {
	if (symbol instanceof createPlaceholderToken) {
		return createParameters[symbol.index];
	}
	else if (symbol instanceof placeholderToken) {
		return parameters[symbol.index];
	}
	else {
		return symbol;
	}
}

module.exports = {wildcardToken, placeholderToken, createPlaceholderToken, replaceSymbolicParameters, memory, entity, assertion, assertionQuery, knowledgeBase, checkAssertion, getAllPossibleParameterMatches, getAllPossibleActionVariableReplacements, getAvailableActions, executeAction, isComputedAction};
