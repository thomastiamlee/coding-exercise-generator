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
		it("All primitives from the knowledge base should have been extracted.", function() {
			Assert(res.primitives && res.primitives.length == 8);
			var checklist = ["nonnegativevalue*", "personname*", "massvalue*"];
			for (var i = 0; i < res.primitives.length; i++) {
				if (checklist.indexOf(res.primitives[i]) != -1) {
					checklist.splice(checklist.indexOf(res.primitives[i]), 1);
				}
			}
			Assert(checklist.length == 0);
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
	describe("#assertionIsTrue()", function() {
		var kb = Parser.parseKnowledgeBase("./test/kbmatchtext.txt");
		var space = ["student", "person", "dog", "cat", "pet"];
		var table = PlannerUtility.initializeMemoryTable(space, kb);
		var assertion1 = { truth: true, predicate: "has", parameters: ["person", "height*"] };
		var test1 = PlannerUtility.assertionIsTrue(assertion1, kb);
		var assertion2 = { truth: true, predicate: "has", parameters: ["student", "height*"] };
		var test2 = PlannerUtility.assertionIsTrue(assertion2, kb);
		var assertion3 = { truth: false, predicate: "has", parameters: ["person", "height*"] };
		var test3 = PlannerUtility.assertionIsTrue(assertion3, kb);
		var assertion4 = { truth: false, predicate: "has", parameters: ["student", "height*"] };
		var test4 = PlannerUtility.assertionIsTrue(assertion4, kb);
		var assertion5 = { truth: true, predicate: "has", parameters: ["student1", "height*"] };
		var test5 = PlannerUtility.assertionIsTrue(assertion5, kb);
		var assertion6 = { truth: true, predicate: "canown", parameters: ["person2", "pet5"] };
		var test6 = PlannerUtility.assertionIsTrue(assertion6, kb);
		var assertion7 = { truth: true, predicate: "has", parameters: ["pet5", "height*"] };
		var test7 = PlannerUtility.assertionIsTrue(assertion7, kb);
		var assertion8 = { truth: false, predicate: "bestfriend", parameters: ["student1", "dog3"] };
		var test8 = PlannerUtility.assertionIsTrue(assertion8, kb);
		var assertion9 = { truth: true, predicate: "hungry", parameters: ["dog3"] };
		var test9 = PlannerUtility.assertionIsTrue(assertion9, kb);
		it("has(person height*) should be true.", function() { Assert(test1); });
		it("has(student height*) should be true.", function() { Assert(test2); });
		it("!has(person height*) should be false.", function() { Assert(!test3); });
		it("!has(student height*) should be false.", function() { Assert(!test4); });
		it("has(student1 height*) should be true.", function() { Assert(test5); });
		it("canown(person2 pet5) should be true.", function() { Assert(test6); });
		it("has(pet5 height*) should be false.", function() { Assert(!test7); });
		it("!bestfriend(student1 dog3) should be false.", function() { Assert(!test8); });
		it("hungry(dog3) should be false.", function() { Assert(!test9); });
	});
	describe("#getAllPossibleActionVariableReplacements()", function() {
		var kb = Parser.parseKnowledgeBase("./test/kbmatchtext.txt");
		var space = ["student", "person", "dog", "cat", "pet"];
		var table = PlannerUtility.initializeMemoryTable(space, kb);
		var actionList = kb.action_list;
		var feedAction = actionList[PlannerUtility.fetchActionIndex(actionList, "feed")];
		var mentionHeightAction = actionList[PlannerUtility.fetchActionIndex(actionList, "mentionheight")];
		PlannerUtility.addAssertion(kb, { truth: true, predicate: "hungry", parameters: ["dog3"] });
		PlannerUtility.addAssertion(kb, { truth: true, predicate: "owns", parameters: ["student1", "dog3"] });
		PlannerUtility.addAssertion(kb, { truth: true, predicate: "owns", parameters: ["student1", "cat4"] });
		var test1 = PlannerUtility.getAllPossibleActionVariableReplacements(feedAction, table, kb);
		var test2 = PlannerUtility.getAllPossibleActionVariableReplacements(mentionHeightAction, table, kb);
		it("test1 should have one possibility: feed(student1 dog3).", function() {
			Assert(test1.length == 1 && test1[0][0] == "student1" && test1[0][1] == "dog3");
		});
		it("test2 should have 2 possibilities: mentionheight(student1), mentionheight(person2), and mentionheight(cat4).", function() {
			var x = false, y = false, z = false;
			for (var i = 0; i < test2.length; i++) {
				if (test2[i][0] == "student1") x = true;
				if (test2[i][0] == "person2") y = true;
				if (test2[i][0] == "cat4") z = true;
			}
			Assert(test2.length == 3 && x && y && z);
		});
	});
	describe("#addAssertion()", function() {
		var kb = Parser.parseKnowledgeBase("./test/kbmatchtext.txt");
		var space = ["student", "person", "dog", "cat", "pet"];
		var table = PlannerUtility.initializeMemoryTable(space, kb);
		PlannerUtility.addAssertion(kb, { truth: true, predicate: "hungry", parameters: ["dog3"]});
		PlannerUtility.addAssertion(kb, { truth: true, predicate: "owns", parameters: ["student1", "dog3"]});
		PlannerUtility.addAssertion(kb, { truth: false, predicate: "bestfriend", parameters: ["person", "dog"]});
		var relationshipList = kb.relationship_list;
		it("The relationship hungry(dog3) should have been added", function() {
			var found = false;
			for (var i = 0; i < relationshipList.length; i++) {
				var current = relationshipList[i];
				if (current.predicate == "hungry") {
					if (current.parameters.length == 1 && current.parameters[0] == "dog3") {
						found = true;
						break;
					}
				}
			}
			Assert(found);
		});
		it("The relationship owns(student1 dog3) should have been added", function() {
			var found = false;
			for (var i = 0; i < relationshipList.length; i++) {
				var current = relationshipList[i];
				if (current.predicate == "owns") {
					if (current.parameters.length == 2 && current.parameters[0] == "student1" && current.parameters[1] == "dog3") {
						found = true;
						break;
					}
				}
			}
			Assert(found);
		});	
		it("The relationship bestfriend(person dog) should have been removed", function() {
			var found = false;
			for (var i = 0; i < relationshipList.length; i++) {
				var current = relationshipList[i];
				if (current.predicate == "bestfriend") {
					if (current.parameters.length == 2 && current.parameters[0] == "person" && current.parameters[1] == "dog") {
						found = true;
						break;
					}
				}
			}
			Assert(!found);
		});
	});
});