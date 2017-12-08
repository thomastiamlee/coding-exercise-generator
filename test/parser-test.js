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
			Assert(result.getAction().length == 2);
		});
		it("The mention action should have been read.", function() {
			var mention = result.getAction("mention");
			console.log("MENTION");
			console.log(mention);
			Assert(mention.name == "mention");
			Assert(mention.parameters.length == 2);
			Assert(mention.parameters[0] instanceof PlannerUtility.wildcardToken);
			Assert(mention.parameters[1] instanceof PlannerUtility.wildcardToken);
			Assert(mention.preconditions.length == 2);
			Assert(mention.preconditions[0].truth == true);
			Assert(mention.preconditions[0].predicate == "has");
			Assert(mention.preconditions[0].parameters.length == 2);
			Assert(mention.preconditions[0].parameters[0].index == 0);
			Assert(mention.preconditions[0].parameters[1].index == 1);
			Assert(mention.preconditions[1].truth == false);
			Assert(mention.preconditions[1].predicate == "visible");
			Assert(mention.preconditions[1].parameters.length == 2);
			Assert(mention.preconditions[1].parameters[0].index == 0);
			Assert(mention.preconditions[1].parameters[1].index == 1);
			Assert(mention.effects.length == 1);
			Assert(mention.effects[0].truth == true);
			Assert(mention.effects[0].predicate == "visible");
			Assert(mention.effects[0].parameters.length == 2);
			Assert(mention.effects[0].parameters[0].index == 0);
			Assert(mention.effects[0].parameters[1].index == 1);
		});
		it("The eat action should have been read.", function() {
			var eat = result.getAction("eat");
			Assert(eat.name == "eat");
			Assert(eat.parameters.length == 2);
			Assert(eat.parameters[0] == result.getGlobalEntity("person"));
			Assert(eat.parameters[1] == result.getGlobalEntity("food"));
			Assert(eat.preconditions.length == 0);
			Assert(eat.effects.length == 0);
		});
	});
});
