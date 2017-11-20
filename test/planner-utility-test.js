const Assert = require("assert");
const PlannerUtility = require("../src/planner-utility");
const Parser = require("../src/parser");

describe("planner-utility", function() {
	describe("#isPrimitive()", function() {
		it("name should not be primitive", function() {
			Assert(PlannerUtility.isPrimitive("name") == false);
		});
		it("height should not be primitive", function() {
			Assert(PlannerUtility.isPrimitive("height") == false);
		});
		it("name* should be primitive", function() {
			Assert(PlannerUtility.isPrimitive("name*") == true);
		});
		it("height* should be primitive", function() {
			Assert(PlannerUtility.isPrimitive("height*") == true);
		});
	});
	describe("#initializeMemoryTable()", function() {
		var kb = Parser.parseKnowledgeBase("./test/kbtest.txt");
		var space = ["person", "restaurant", "ramen"];
		var res = PlannerUtility.initializeMemoryTable(space, kb);
		var invalidSpace = ["person", "height*"];
		var invalidRes = PlannerUtility.initializeMemoryTable(invalidSpace, kb);
		
		it("Memory table should be of length 3.", function() {
			Assert(res.length == 3);
		});
		it("The first element should be {id: \"person1\", type: \"person\", memory: []]", function() {
			Assert(res[0].id == "person1" && res[0].type == "person" && res[0].memory.length == 0);
		});
		it("The third element should be {id: \"ramen3\", type: \"ramen\", memory: []]", function() {
			Assert(res[2].id == "ramen3" && res[2].type == "ramen" && res[2].memory.length == 0);
		});
		it("A space with primitives should return null.", function() {
			Assert(invalidRes == null);
		});
	});
	describe("#fetchTypeIndex()", function() {
		var kb = Parser.parseKnowledgeBase("./test/kbtest.txt");
		var typeList = kb.type_list;
		var type1 = typeList[PlannerUtility.fetchTypeIndex(typeList, "person")];
		var type2 = typeList[PlannerUtility.fetchTypeIndex(typeList, "stringvalue*")];
		var type3 = typeList[PlannerUtility.fetchTypeIndex(typeList, "food")];
		var type4 = PlannerUtility.fetchTypeIndex(typeList, "banana");
		
		it("type1 should be the person type.", function() {
			Assert(type1.length == 2 && type1[0] == "person" && type1[1].length == 0);
		});
		it("type2 should be the stringvalue* type.", function() {
			Assert(type2.length == 2 && type2[0] == "stringvalue*" && type2[1].length == 0);
		});
		it("type3 should be the food type.", function() {
			Assert(type3.length == 2 && type3[0] == "food" && type3[1][0] == "object");
		});
		it("type4 does not exist and should be -1", function() {
			Assert(type4 == -1);
		});
	});
	describe("#fetchActionIndex()", function() {
		var kb = Parser.parseKnowledgeBase("./test/kbtest.txt");
		var actionList = kb.action_list;
		var action1 = actionList[PlannerUtility.fetchActionIndex(actionList, "eat")];
		var action2 = actionList[PlannerUtility.fetchActionIndex(actionList, "mention")];
		it("action1 should be the eat action.", function() {
			Assert(action1.name == "eat" && action1.parameters && action1.preconditions && action1.effects);
		});
		it("action2 should be the mention action.", function() {
			Assert(action2.name == "mention" && action2.parameters && action2.preconditions && action2.effects);
		});
	});
	describe("#isExtendedFrom()", function() {
		var kb = Parser.parseKnowledgeBase("./test/kbextendtest.txt");
		var test1 = PlannerUtility.isExtendedFrom("student", "person", kb);
		var test2 = PlannerUtility.isExtendedFrom("student", "student", kb);
		var test3 = PlannerUtility.isExtendedFrom("person", "student", kb);
		var test4 = PlannerUtility.isExtendedFrom("spaghetti", "object", kb);
		var test5 = PlannerUtility.isExtendedFrom("dog", "animal", kb);
		var test6 = PlannerUtility.isExtendedFrom("dog", "cat", kb);
		var test7 = PlannerUtility.isExtendedFrom("bulldog", "cat", kb);
		var test8 = PlannerUtility.isExtendedFrom("distancevalue*", "nonnegativevalue*", kb);
		it ("student is an offspring of the person.", function() { Assert(test1);	});
		it ("student is an offspring of the student.", function() {	 Assert(test2); });
		it ("person is not an offspring of the student.", function() { Assert(!test3); });
		it ("spaghetti is an offspring of the object.", function() { Assert(test4); });
		it ("dog is an offspring of the animal.", function() { Assert(test5); });
		it ("dog is not an offspring of the cat.", function() { Assert(!test6); });
		it ("bulldog is not an offspring of the cat.", function() { Assert(!test7); });
		it ("distancevalue* is an offspring of the nonnegativevalue*.", function() { Assert(test8); });
	});
	describe("#getAllPossibleParameterMatches()", function() {
		var kb = Parser.parseKnowledgeBase("./test/kbmatchtext.txt");
		var space = ["student", "person", "dog", "cat", "pet"];
		var table = PlannerUtility.initializeMemoryTable(space, kb);
		var actionList = kb.action_list;
		var feedAction = actionList[PlannerUtility.fetchActionIndex(actionList, "feed")];
		var test1 = PlannerUtility.getAllPossibleParameterMatches(feedAction, table, kb);
		it("In the feed action, student and person should match the person parameter.", function() {
			Assert(test1[0].length == 2);
			var cond1 = false, cond2 = false;
			for (var i = 0; i < test1[0].length; i++) {
				if (test1[0][i].type == "person") cond1 = true;
				else if (test1[0][i].type == "student") cond2 = true;
			}
			Assert(cond1 && cond2);
		});
		it("In the feed action, dog, cat and pet should match the pet parameter.", function() {
			Assert(test1[1].length == 3);
			var cond1 = false, cond2 = false, cond3 = false; 
			for (var i = 0; i < test1[1].length; i++) {
				if (test1[1][i].type == "dog") cond1 = true;
				else if (test1[1][i].type == "cat") cond2 = true;
				else if (test1[1][i].type == "pet") cond2 = true;
			}
			Assert(cond1 && cond2);
		});
	});
});