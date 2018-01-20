var existent = function(name) {
	this.name = name;
	this.parent = null;
	this.isExtendedFrom = function(other) {
		var current = this;
		while (current != null) {
			if (current == other) return true;
			current = current.parent;
		}
	}
}
var assertion = function(predicate, parameters) {
	this.predicate = predicate;
	this.parameters = parameters;
}	
var action = function(name, parameters, preconditions, postconditions) {
	this.name = name;
	this.parameters = parameters;
	this.preconditions = preconditions;
	this.postconditions = postconditions;
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
}
var domain = function(existents, assertions, actions) {
	this.existents = [];
	this.assertions = [];
	this.actions = [];
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
	for (var i = 0; i < existents.length; i++) {
		this.existents.push(new existent(existents[i].name));
	}
	for (var i = 0; i < existents.length; i++) {
		if (existents[i].parent) {
			this.getExistentByName(existents[i].name).parent = this.getExistentByName(existents[i].parent);
		}
		this.existents.push(new existent(existents[i].name));
	}
	for (var i = 0; i < assertions.length; i++) {
		var predicate = assertions[i].predicate;
		var parameters = assertions[i].parameters;
		for (var j = 0; j < parameters.length; j++) {
			parameters[j] = this.getExistentByName(parameters[j]);
		}
		this.assertions.push(new assertion(predicate, parameters));
	}
	for (var i = 0; i < actions.length; i++) {
		var name = actions[i].name;
		var parameters = actions[i].parameters;
		for (var j = 0; j < parameters.length; j++) {
			parameters[j].type = this.getExistentByName(parameters[j].type);
		}
		var preconditions = actions[i].preconditions;
		var postconditions = actions[i].postconditions;
		this.actions.push(new action(name, parameters, preconditions, postconditions));
	}
}
var query = function(truth, predicate, parameters) {
	this.truth = truth;
	this.predicate = predicate;
	this.parameters = parameters;
}
var state = function(truths) {
	this.truths = truths;
}

module.exports = {domain, existent};