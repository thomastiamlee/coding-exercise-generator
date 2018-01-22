var existent = function(name) {
	this.name = name;
	this.parent = null;
	this.type = null;
	this.isExtendedFrom = function(other) {
		var current = this;
		while (current != null) {
			if (current == other) return true;
			current = current.parent;
		}
	}
	this.getAlias = function() {
		if (!this.alias) {
			return this.name;
		}
		return this.alias;
	}
}
var assertion = function(predicate, parameters) {
	this.predicate = predicate;
	this.parameters = parameters;
	this.getParameterMatchings = function(existents) {	
		var possibilities = [];
		var result = [];
		for (var i = 0; i < this.parameters.length; i++) {
			possibilities.push([]);
			var current = this.parameters[i];
			for (var j = 0; j < existents.length; j++) {
				if (existents[j].isExtendedFrom(current)) {
					possibilities[i].push(existents[j]);
				}
			}
		}
		var combinations = 1;
		for (var i = 0; i < possibilities.length; i++) {
			combinations *= possibilities[i].length;
		}
		for (var i = 0; i < combinations; i++) {
			var matching = [];
			var c = 1;
			for (var j = 0; j < possibilities.length; j++) {
				var len = possibilities[j].length;
				matching.push(possibilities[j][Math.floor(i / c) % len]);
				c *= len;
			}
			var duplicate = [];
			var valid = true;
			for (var j = 0; j < matching.length; j++) {
				if (duplicate.indexOf(matching[j]) != -1) {
					valid = false;
					break;
				}
				duplicate.push(matching[j]);
			}
			result.push(matching);
		}
		return result;
	}
}
var buildAssertion = function(parent, buildParameters, buildAssertions) {
	this.parent = parent;
	this.buildParameters = buildParameters;
	this.buildAssertions = buildAssertions;
}
var action = function(name, parameters, requirements, preconditions, postconditions, texts, aliases, logic, mainText, subText) {
	this.name = name;
	this.parameters = parameters;
	this.requirements = requirements;
	this.preconditions = preconditions;
	this.postconditions = postconditions;
	this.texts = texts;
	this.aliases = aliases;
	this.logic = logic;
	this.mainText = mainText;
	this.subText = subText;
	this.getParameterMatchings = function(existents) {	
		var possibilities = [];
		var result = [];
		for (var i = 0; i < this.parameters.length; i++) {
			possibilities.push([]);
			var current = this.parameters[i].type;
			for (var j = 0; j < existents.length; j++) {
				if (existents[j].isExtendedFrom(current)) {
					possibilities[i].push(existents[j]);
				}
			}
		}
		var combinations = 1;
		for (var i = 0; i < possibilities.length; i++) {
			combinations *= possibilities[i].length;
		}
		for (var i = 0; i < combinations; i++) {
			var matching = [];
			var c = 1;
			for (var j = 0; j < possibilities.length; j++) {
				var len = possibilities[j].length;
				matching.push(possibilities[j][Math.floor(i / c) % len]);
				c *= len;
			}
			var duplicate = [];
			var valid = true;
			for (var j = 0; j < matching.length; j++) {
				if (duplicate.indexOf(matching[j]) != -1) {
					valid = false;
					break;
				}
				duplicate.push(matching[j]);
			}
			result.push(matching);
		}
		return result;
	}
	this.applyParametersToAssertions = function(parameters, assertions) {
		var mappings = [];
		for (var i = 0; i < this.parameters.length; i++) {
			mappings.push({name: this.parameters[i].symbol, replacement: parameters[i]});
		}
		var result = [];
		for (var i = 0; i < assertions.length; i++) {
			var truth = assertions[i].truth;
			var predicate = assertions[i].predicate;
			var replaced = [];
			for (var j = 0; j < assertions[i].parameters.length; j++) {
				var current = assertions[i].parameters[j];
				for (var k = 0; k < mappings.length; k++) {
					if (mappings[k].name == current) {
						replaced.push(mappings[k].replacement);
						break;
					}
				}
			}
			result.push(new query(truth, predicate, replaced));
		}
		return result;
	}
	this.applyParametersToPreconditions = function(parameters) {
		return this.applyParametersToAssertions(parameters, this.preconditions);
	}
	this.applyParametersToPostconditions = function(parameters) {
		return this.applyParametersToAssertions(parameters, this.postconditions);
	}
	this.applyParametersToRequirements = function(parameters) {
		return this.applyParametersToAssertions(parameters, this.requirements);
	}
}
var constraint = function(name, dataType, specifications) {
	this.name = name;
	this.dataType = dataType;
	this.specifications = specifications;
	
	this.getRandomValue = function() {
		var chosen = null;
		if (this.specifications.type == "set") {
			var values = this.specifications.values;
			chosen = values[Math.floor(Math.random() * values.length)];
		}
		if (this.dataType == "number") {
			return parseFloat(chosen);
		}
		if (this.dataType == "integer") {
			return parseInt(chosen);
		}
		return chosen;
	}
}
var domain = function(existents, assertions, actions, logicActions, constraints) {
	this.existents = [];
	this.assertions = [];
	this.buildAssertions = [];
	this.actions = [];
	this.logicActions = [];
	this.constraints = [];
	this.getExistentByName = function(name) {
		for (var i = 0; i < this.existents.length; i++) {
			if (this.existents[i].name == name) {
				return this.existents[i];
			}
		}
		console.log("warning: attempted to get a non-existent existent name " + name);
		return null;
	}
	this.getActionByName = function(name) {
		for (var i = 0; i < this.actions.length; i++) {
			if (this.actions[i].name == name) {
				return this.actions[i];
			}
		}
		console.log("warning: attempted to get a non-existent action name " + name);
		return null;
	}
	this.getConstraintByName = function(name) {
		for (var i = 0; i < this.constraints.length; i++) {
			if (this.constraints[i].name == name) {
				return this.constraints[i];
			}
		}
		console.log("warning: attempted to get a non-existent constraint name " + name);
		return null;
	}
	for (var i = 0; i < existents.length; i++) {
		var newExistent = new existent(existents[i].name);
		newExistent.type = existents[i].existentType;
		this.existents.push(newExistent);
	}
	for (var i = 0; i < existents.length; i++) {
		if (existents[i].parent) {
			this.getExistentByName(existents[i].name).parent = this.getExistentByName(existents[i].parent);
		}
	}
	for (var i = 0; i < assertions.length; i++) {
		var type = assertions[i].type;
		if (type == "global") {
			var predicate = assertions[i].predicate;
			var parameters = assertions[i].parameters;
			for (var j = 0; j < parameters.length; j++) {
				parameters[j] = this.getExistentByName(parameters[j]);
			}
			this.assertions.push(new assertion(predicate, parameters));
		}
		else if (type == "local") {
			var parent = this.getExistentByName(assertions[i].parent);
			var buildParameters = assertions[i].buildParameters;
			for (var j = 0; j < buildParameters.length; j++) {
				buildParameters[j].type = this.getExistentByName(buildParameters[j].type);
			}
			var buildAssertions = assertions[i].buildAssertions;
			this.buildAssertions.push(new buildAssertion(parent, buildParameters, buildAssertions));
		}
	}
	for (var i = 0; i < actions.length; i++) {
		var name = actions[i].name;
		var parameters = actions[i].parameters;
		for (var j = 0; j < parameters.length; j++) {
			parameters[j].type = this.getExistentByName(parameters[j].type);
		}
		var preconditions = actions[i].preconditions;
		var postconditions = actions[i].postconditions;
		var texts = actions[i].texts;
		var aliases = actions[i].aliases;
		this.actions.push(new action(name, parameters, null, preconditions, postconditions, texts, aliases, null, null, null));
	}
	for (var i = 0; i < logicActions.length; i++) {
		var name = logicActions[i].name;
		var parameters = logicActions[i].parameters;
		for (var j = 0; j < parameters.length; j++) {
			parameters[j].type = this.getExistentByName(parameters[j].type);
		}
		var requirements = logicActions[i].requirements;
		var preconditions = logicActions[i].preconditions;
		var postconditions = logicActions[i].postconditions;
		var logic = logicActions[i].logic;
		var mainText = logicActions[i].mainText;
		var subText = logicActions[i].subText;
		this.logicActions.push(new action(name, parameters, requirements, preconditions, postconditions, null, null, logic, mainText, subText));
	}
	for (var i = 0; i < constraints.length; i++) {
		this.constraints.push(new constraint(constraints[i].name, constraints[i].dataType, constraints[i].specification));
	}
}

var query = function(truth, predicate, parameters) {
	this.truth = truth;
	this.predicate = predicate;
	this.parameters = parameters;
	this.isSameWith = function(other) {
		if (this.truth != other.truth) return false;
		if (this.predicate != other.predicate) return false;
		if (this.parameters.length != other.parameters.length) return false;
		for (var i = 0; i < other.parameters.length; i++) {
			if (this.parameters[i] != other.parameters[i]) return false;
		}
		return true;
	}
	this.isOppositeWith = function(other) {
		if (this.truth == other.truth) return false;
		if (this.predicate != other.predicate) return false;
		if (this.parameters.length != other.parameters.length) return false;
		for (var i = 0; i < other.parameters.length; i++) {
			if (this.parameters[i] != other.parameters[i]) return false;
		}
		return true;
	}
}
var state = function(truths) {
	this.truths = truths;
	this.isSameWith = function(other) {
		var temp = [].concat(this.truths);
		if (temp.length != other.truths.length) return false;
		for (var i = 0; i < other.truths.length; i++) {
			var index = -1;
			for (var j = 0; j < temp.length; j++) {
				if (temp[j].isSameWith(other.truths[i])) {
					index = j;
					break;
				}
			}
			if (index == -1) return false;
			temp.splice(index, 1);
		}
		return temp.length == 0;
	}
	this.regress = function(action, parameters) {
		var preconditions = action.applyParametersToPreconditions(parameters);
		var postconditions = action.applyParametersToPostconditions(parameters);
		var newTruths = [];
		var removed = [];
		for (var i = 0; i < this.truths.length; i++) {
			var toRemove = false;
			for (var j = 0; j < postconditions.length; j++) {
				if (this.truths[i].isSameWith(postconditions[j])) {
					removed.push(postconditions[j]);
					toRemove = true;
					break;
				}
				else if (this.truths[i].isOppositeWith(postconditions[j])) {
					return null;
				}
			}
			if (!toRemove) newTruths.push(this.truths[i]);
		}
		if (newTruths.length == this.truths.length) return null;
		for (var i = 0; i < preconditions.length; i++) {
			var found = false;
			for (var j = 0; j < newTruths.length; j++) {
				if (newTruths[j].isSameWith(preconditions[i])) {
					found = true;
					break;
				}
				else if (newTruths[j].isOppositeWith(preconditions[i])) {
					return null;
				}
			}
			if (!found) newTruths.push(preconditions[i]);
		}
		return new state(newTruths);
	}
	this.isSatisfiedBy = function(other) {
		for (var i = 0; i < this.truths.length; i++) {
			var current = this.truths[i];
			if (current.truth == true) {
				var satisfied = false;
				for (var j = 0; j < other.truths.length; j++) {
					if (other.truths[j].isSameWith(current)) { satisfied = true; break; }
				}
			}
			else {
				var satisfied = true;
				for (var j = 0; j < other.truths.length; j++) {
					if (other.truths[j].isOppositeWith(current)) { satisfied = false; break; }
					break;
				}
			}
			if (!satisfied) { return false; }
		}
		return true;
	}
}

module.exports = {domain, existent, state, query};