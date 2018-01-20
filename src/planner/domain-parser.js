const File = require("fs");
const Peg = require("pegjs");

const domainPath = "./src/planner/domain";
const grammarPath = "./src/planner/grammar";

var domain = function(existents, assertions, actions) {
	var existent = function(name) {
		this.name = name;
		this.parent = null;
		this.isExtendedFrom = function(other) {
			var current = this;
			while (current != null) {
				if (current == other) return true;
				current = this.parent;
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
	}
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

function parseExistents() {
	var grammar = File.readFileSync(grammarPath + "/existents-grammar.txt", "utf-8");
	var existents = File.readFileSync(domainPath + "/existents.txt", "utf-8");
	var parser = Peg.generate(grammar, {trace: false});
	var result = parser.parse(existents);
	return result;
}

function parseAssertions() {
	var grammar = File.readFileSync(grammarPath + "/assertions-grammar.txt", "utf-8");
	var existents = File.readFileSync(domainPath + "/assertions.txt", "utf-8");
	var parser = Peg.generate(grammar, {trace: false});
	var result = parser.parse(existents);
	return result;
}

function parseActions() {
	var grammar = File.readFileSync(grammarPath + "/actions-grammar.txt", "utf-8");
	var parser = Peg.generate(grammar, {trace: false});
	var result = [];
	File.readdirSync(domainPath + "/actions").forEach(file => {
		var actions = File.readFileSync(domainPath + "/actions/" + file.toString(), "utf-8");
		var temp = parser.parse(actions);
		result = result.concat(temp);
	});
	return result;
}

function parseDomain() {
	var existents = parseExistents();
	var assertions = parseAssertions();
	var actions = parseActions();
	
	return new domain(existents, assertions, actions);
}

module.exports = {parseDomain};