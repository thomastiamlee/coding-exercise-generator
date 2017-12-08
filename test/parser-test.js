const Assert = require("assert");
const Parser = require("../src/parser");
const PlannerUtility = require("../src/planner-utility");

describe("parser", function() {
	describe("#parseKnowledgeBase", function() {

		var result = Parser.parseKnowledgeBase("./test/kbtest.txt");
		it ("Global entities list should contain 15 elements.", function() {
			Assert(result.globalEntities && Object.keys(result.globalEntities).length == 15);
		});
		it("The person global entity should have been read.", function() {
			Assert(result.globalEntities["person"] instanceof PlannerUtility.entity);
		});
		it("The restaurant global entity should have been read.", function() {
			Assert(result.globalEntities["restaurant"] instanceof PlannerUtility.entity);
		});
		it("The personname global entity should have been read and its parent should be a stringvalue.", function() {
			Assert(result.globalEntities["personname"] instanceof PlannerUtility.entity);
			Assert(result.globalEntities["personname"].parents[0].name == "stringvalue");
		});
		it ("Global static entities list should contain 3 elements.", function() {
			Assert(result.globalStaticEntities && Object.keys(result.globalStaticEntities).length == 3);
		});
		it("The global static entity distanceunit should have been read.", function() {
			Assert(result.globalStaticEntities["distanceunit"] instanceof PlannerUtility.entity);
		});
		it("The global static entity feet should have been read and its parent should be a distancevalue.", function() {
			Assert(result.globalStaticEntities["feet"] instanceof PlannerUtility.entity);
			Assert(result.globalStaticEntities["feet"].parents[0].name == "distanceunit");
		});
		it("Assertions list should contain 4 elements.", function() {
			var count = 0;
			for (var prop in result.globalAssertions) {
				count += result.globalAssertions[prop].length;
			}
			Assert(count == 4);
		});
		it ("has(person name) should have been read.", function() {
			Assert(result.globalAssertions["has"]);
			var list = result.globalAssertions["has"];
			var found = false;
			for (var i = 0; i < list.length; i++) {
				if (list[i].parameters[0].name == "person" && list[i].parameters[1].name == "personname") {
					found = true;
					break;
				}
			}
			Assert(found);
		});
		it ("foundin(ramen restaurant) should have been read.", function() {
			Assert(result.globalAssertions["foundin"]);
			var list = result.globalAssertions["foundin"];
			var found = false;
			for (var i = 0; i < list.length; i++) {
				if (list[i].parameters[0].name == "ramen" && list[i].parameters[1].name == "restaurant") {
					found = true;
					break;
				}
			}
			Assert(found);
		});
		it("Actions list should contain 2 elements.", function() {
			Assert(result.actions.length == 2);
		});
		it("The mention action should have been read.", function() {
			Assert(result.actions[0].name == "mention");
			Assert(result.actions[0].parameters.length == 2);
			Assert(result.actions[0].parameters[0] == "*");
			Assert(result.actions[0].parameters[1] == "*");
			Assert(result.actions[0].preconditions.length == 2);
			Assert(result.actions[0].preconditions[0].truth == true);
			Assert(result.actions[0].preconditions[0].predicate == "has");
			Assert(result.actions[0].preconditions[0].parameters.length == 2);
			Assert(result.actions[0].preconditions[0].parameters[0] == "0");
			Assert(result.actions[0].preconditions[0].parameters[1] == "1");
			Assert(result.actions[0].preconditions[1].truth == false);
			Assert(result.actions[0].preconditions[1].predicate == "visible");
			Assert(result.actions[0].preconditions[1].parameters.length == 2);
			Assert(result.actions[0].preconditions[1].parameters[0] == "0");
			Assert(result.actions[0].preconditions[1].parameters[1] == "1");
			Assert(result.actions[0].effects.length == 1);
			Assert(result.actions[0].effects[0].truth == true);
			Assert(result.actions[0].effects[0].predicate == "visible");
			Assert(result.actions[0].effects[0].parameters.length == 2);
			Assert(result.actions[0].effects[0].parameters[0] == "0");
			Assert(result.actions[0].effects[0].parameters[1] == "1");
		});
		it("The eat action should have been read.", function() {
			Assert(result.actions[1].name == "eat");
			Assert(result.actions[1].parameters.length == 2);
			Assert(result.actions[1].parameters[0] == "person");
			Assert(result.actions[1].parameters[1] == "food");
			Assert(result.actions[1].preconditions.length == 0);
			Assert(result.actions[1].effects.length == 0);
		});
	});
});
