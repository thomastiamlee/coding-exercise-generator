const fs = require("fs");
const Peg = require("pegjs");
const PlannerUtility = require("./planner-utility");



/* Parses the knowledge base and returns a JavaScript object containing all its rules. */
function parseKnowledgeBase(path) {
	var grammar = fs.readFileSync("./src/grammar/domain-new.txt", "utf-8");
	var kb = fs.readFileSync(path, "utf-8");
	var parser = Peg.generate(grammar, {trace: false});
	var result = parser.parse(kb);
	var kb = new PlannerUtility.knowledgeBase();
	var global_list = result.global_list;
	var static_list = result.static_list;
	var assertion_list = result.assertion_list;
	var action_list = result.action_list;
	var globalEntities = [];
	for (var i = 0; i < global_list.length; i++) {
		var current = global_list[i];
		var name = current[0];
		var parents = current[1];
		for (var j = 0; j < parents.length; j++) {
			parents[j] = globalEntities[parents[j]];
			if (parents[j] == undefined) {
				console.error("Warning: undefined parent");
			}
		}
		var newObj = new PlannerUtility.entity(current[0], parents, "global", true);
		globalEntities[current[0]] = newObj;
	}
	var globalStaticEntities = [];
	for (var i = 0; i < static_list.length; i++) {
		var current = static_list[i];
		var name = current[0];
		var parents = current[1];
		for (var j = 0; j < parents.length; j++) {
			parents[j] = globalStaticEntities[parents[j]];
			if (parents[j] == undefined) {
				console.error("Warning: undefined parent");
			}
		}
		var newObj = new PlannerUtility.entity(current[0], parents, "global", false);
		globalStaticEntities[current[0]] = newObj;
	}
	var globalAssertions = [];
	for (var i = 0; i < assertion_list.length; i++) {
		var current = assertion_list[i];
		var predicate = current.predicate;
		var parameters = current.parameters;
		for (var j = 0; j < parameters.length; j++) {
			if (globalEntities[parameters[j]]) {
				parameters[j] = globalEntities[parameters[j]];
			}
			else if (globalStaticEntities[parameters[j]]) {
				parameters[j] = globalStaticEntities[parameters[j]];
			}
		}
		var newObj = new PlannerUtility.assertion(predicate, parameters);
		if (!globalAssertions[predicate]) {
			globalAssertions[predicate] = [];
		}
		globalAssertions[predicate].push(newObj);
	}
	var actions = [];
	for (var i = 0; i < action_list.length; i++) {
		var current = action_list[i];
		var name = current.name;
		var parameters = current.parameters;
		var preconditions = current.preconditions;
		var creates = current.creates;
		var effects = current.effects;
		var blockData = current.blockData;

		var newObj = {name: name, parameters: parameters, preconditions: preconditions, creates: creates, effects: effects, blockData: blockData};
		actions.push(newObj);
	}

	kb.globalEntities = globalEntities;
	kb.globalStaticEntities = globalStaticEntities;
	kb.globalAssertions = globalAssertions;
	kb.actions = actions;

	return kb;
}

module.exports = {parseKnowledgeBase};
