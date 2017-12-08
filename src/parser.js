const fs = require("fs");
const Peg = require("pegjs");
const PlannerUtility = require("./planner-utility");

/* Parses the knowledge base and returns a JavaScript object containing all its rules. */
function parseKnowledgeBase(path) {
	var grammar = fs.readFileSync("./src/grammar/domain.txt", "utf-8");
	var kb = fs.readFileSync(path, "utf-8");
	var parser = Peg.generate(grammar, {trace: false});
	var result = parser.parse(kb);
	/*var kb = new PlannerUtility.knowledgeBase();
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
			var found = false;
			for (var k = 0; k < globalEntities.length; k++) {
				if (globalEntities[k].name == parents[j]) {
					parents[j] = globalEntities[k];
					found = true;
					break;
				}
			}
		}
		var newObj = new PlannerUtility.entity(current[0], parents, "global", true);
		globalEntities.push(newObj);
	}
	var globalStaticEntities = [];
	for (var i = 0; i < static_list.length; i++) {
		var current = static_list[i];
		var name = current[0];
		var parents = current[1];
		for (var j = 0; j < parents.length; j++) {
			var found = false;
			for (var k = 0; k < globalStaticEntities.length; k++) {
				if (globalStaticEntities[k].name == parents[j]) {
					parents[j] = globalStaticEntities[k];
					found = true;
					break;
				}
			}
		}
		var newObj = new PlannerUtility.entity(current[0], parents, "global", false);
		globalStaticEntities.push(newObj);
	}
	var assertions = [];
	for (var i = 0; i < assertion_list.length; i++) {
		var current = assertion_list[i];
		var predicate = current.predicate;
	}

	kb.globalEntities = globalEntities;
	kb.globalStaticEntities = globalStaticEntities;

	//PlannerUtility.sortKnowledgeBase(result);
	return kb;*/
	return result;
}

module.exports = {parseKnowledgeBase};
