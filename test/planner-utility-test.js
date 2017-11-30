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
		var res = PlannerUtility.initializeMemoryTable(kb, space);
		var invalidSpace = ["person", "height*"];
		var invalidRes = PlannerUtility.initializeMemoryTable(kb, invalidSpace);
		
		it("Nonprimitives should be of length 3.", function() {
			Assert(res.nonprimitives.length == 3);
		});
		it("The first element should be {id: \"person1\", memory: []]", function() {
			Assert(res.nonprimitives[0].id == "person1" && res.nonprimitives[0].memory.length == 0);
		});
		it("The third element should be {id: \"ramen3\", memory: []]", function() {
			Assert(res.nonprimitives[2].id == "ramen3" && res.nonprimitives[2].memory.length == 0);
		});
		it("A space initialization with primitives should return null.", function() {
			Assert(invalidRes == null);
		});
		it("Primitives should be on length 3.", function() {
			Assert(res.primitives && res.primitives.length == 8);
		});
		it("Primitives should contain nonnegativevalue*, massvalue*, and personname*.", function() {
			var x1 = false, x2 = false, x3 = false;
			for (var i = 0; i < res.primitives.length; i++) {
				if (res.primitives[i].id == "nonnegativevalue*") x1 = true;
				if (res.primitives[i].id == "massvalue*") x2 = true;
				if (res.primitives[i].id == "personname*") x3 = true;
			}
			Assert(x1 && x2 && x3);
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
		var test1 = PlannerUtility.isExtendedFrom(kb, "student", "person");
		var test2 = PlannerUtility.isExtendedFrom(kb, "student", "student");
		var test3 = PlannerUtility.isExtendedFrom(kb, "person", "student");
		var test4 = PlannerUtility.isExtendedFrom(kb, "spaghetti", "object");
		var test5 = PlannerUtility.isExtendedFrom(kb, "dog", "animal");
		var test6 = PlannerUtility.isExtendedFrom(kb, "dog", "cat");
		var test7 = PlannerUtility.isExtendedFrom(kb, "bulldog", "cat");
		var test8 = PlannerUtility.isExtendedFrom(kb, "distancevalue*", "nonnegativevalue*");
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
		var table = PlannerUtility.initializeMemoryTable(kb, space);
		var actionList = kb.action_list;
		var feedAction = actionList[PlannerUtility.fetchActionIndex(actionList, "feed")];
		var test1 = PlannerUtility.getAllPossibleParameterMatches(kb, feedAction, table);
		it("In the feed action, student1 and person2 should match the person parameter.", function() {
			Assert(test1[0].length == 2);
			var cond1 = false, cond2 = false;
			for (var i = 0; i < test1[0].length; i++) {
				if (test1[0][i].id == "person2") cond1 = true;
				else if (test1[0][i].id == "student1") cond2 = true;
			}
			Assert(cond1 && cond2);
		});
		it("In the feed action, dog3, cat4 and pet5 should match the pet parameter.", function() {
			Assert(test1[1].length == 3);
			var cond1 = false, cond2 = false, cond3 = false; 
			for (var i = 0; i < test1[1].length; i++) {
				if (test1[1][i].id == "dog3") cond1 = true;
				else if (test1[1][i].id == "cat4") cond2 = true;
				else if (test1[1][i].id == "pet5") cond2 = true;
			}
			Assert(cond1 && cond2);
		});
	});
	describe("#assertionIsTrue()", function() {
		var kb = Parser.parseKnowledgeBase("./test/kbmatchtext.txt");
		var space = ["student", "person", "dog", "cat", "pet"];
		var table = PlannerUtility.initializeMemoryTable(kb, space);
		var assertion1 = { truth: true, predicate: "has", parameters: ["person", "height*"] };
		var test1 = PlannerUtility.assertionIsTrue(kb, assertion1);
		var assertion2 = { truth: true, predicate: "has", parameters: ["student", "height*"] };
		var test2 = PlannerUtility.assertionIsTrue(kb, assertion2);
		var assertion3 = { truth: false, predicate: "has", parameters: ["person", "height*"] };
		var test3 = PlannerUtility.assertionIsTrue(kb, assertion3);
		var assertion4 = { truth: false, predicate: "has", parameters: ["student", "height*"] };
		var test4 = PlannerUtility.assertionIsTrue(kb, assertion4);
		var assertion5 = { truth: true, predicate: "has", parameters: ["student1", "height*"] };
		var test5 = PlannerUtility.assertionIsTrue(kb, assertion5);
		var assertion6 = { truth: true, predicate: "canown", parameters: ["person2", "pet5"] };
		var test6 = PlannerUtility.assertionIsTrue(kb, assertion6);
		var assertion7 = { truth: true, predicate: "has", parameters: ["pet5", "height*"] };
		var test7 = PlannerUtility.assertionIsTrue(kb, assertion7);
		var assertion8 = { truth: false, predicate: "bestfriend", parameters: ["student1", "dog3"] };
		var test8 = PlannerUtility.assertionIsTrue(kb, assertion8);
		var assertion9 = { truth: true, predicate: "hungry", parameters: ["dog3"] };
		var test9 = PlannerUtility.assertionIsTrue(kb, assertion9);
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
		var table = PlannerUtility.initializeMemoryTable(kb, space);
		var actionList = kb.action_list;
		var feedAction = actionList[PlannerUtility.fetchActionIndex(actionList, "feed")];
		var mentionHeightAction = actionList[PlannerUtility.fetchActionIndex(actionList, "mentionheight")];
		PlannerUtility.addAssertion(kb, { truth: true, predicate: "hungry", parameters: ["dog3"] });
		PlannerUtility.addAssertion(kb, { truth: true, predicate: "owns", parameters: ["student1", "dog3"] });
		PlannerUtility.addAssertion(kb, { truth: true, predicate: "owns", parameters: ["student1", "cat4"] });
		var test1 = PlannerUtility.getAllPossibleActionVariableReplacements(kb, feedAction, table);
		var test2 = PlannerUtility.getAllPossibleActionVariableReplacements(kb,  mentionHeightAction, table);
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
		var table = PlannerUtility.initializeMemoryTable(kb, space);
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
	describe("#getAvailableActions()", function() {
		var kb1 = Parser.parseKnowledgeBase("./test/kbmatchtext.txt");
		var space1 = ["student", "student"];
		var table1 = PlannerUtility.initializeMemoryTable(kb1, space1);
		var availableActions1 = PlannerUtility.getAvailableActions(kb1, table1);
		var kb2 = Parser.parseKnowledgeBase("./test/kbmatchtext.txt");
		var space2 = ["person", "cat"];
		var table2 = PlannerUtility.initializeMemoryTable(kb2, space2);
		PlannerUtility.addAssertion(kb2, {truth: true, predicate: "owns", parameters: ["person1", "cat2"]});
		PlannerUtility.addAssertion(kb2, {truth: true, predicate: "hungry", parameters: ["cat2"]});
		var availableActions2 = PlannerUtility.getAvailableActions(kb2, table2);
		it("In space1, there should be 4 available actions.", function() {
			Assert(availableActions1.length == 4);
		});
		it("In space1, there should be an action for mentioning the height of student1 and student2 and comparing their heights.", function() {
			var x1 = false, x2 = false, x3 = false, x4 = false;
			for (var i = 0; i < availableActions1.length; i++) {
				if (availableActions1[i].action.name == "mentionheight" && availableActions1[i].parameters[0] == "student1") x1 = true;
				if (availableActions1[i].action.name == "mentionheight" && availableActions1[i].parameters[0] == "student2") x2 = true;
				if (availableActions1[i].action.name == "gettaller" && availableActions1[i].parameters[0] == "student1" && availableActions1[i].parameters[1] == "student2") x3 = true;
				if (availableActions1[i].action.name == "gettaller" && availableActions1[i].parameters[0] == "student2" && availableActions1[i].parameters[1] == "student1") x4 = true;
			}
			Assert(x1 && x2 && x3 && x4);
		});
		it("In space2, there should be 3 available actions.", function() {
			Assert(availableActions2.length == 3);
		});
		it("In space2, there should be an action for mentioning the height of student1 and cat2, as well as person1 feeding cat2.", function() {
			var x1 = false, x2 = false, x3 = false;;
			for (var i = 0; i < availableActions2.length; i++) {
				if (availableActions2[i].action.name == "mentionheight" && availableActions2[i].parameters[0] == "person1") x1 = true;
				if (availableActions2[i].action.name == "mentionheight" && availableActions2[i].parameters[0] == "cat2") x2 = true;
				if (availableActions2[i].action.name == "feed" && availableActions2[i].parameters[0] == "person1" && availableActions2[i].parameters[1] == "cat2") x3 = true;
			}
			Assert(x1 && x2 && x3);
		});
	});
	describe("#executeAction()", function() {
		var kb = Parser.parseKnowledgeBase("./test/kbmatchtext.txt");
		var space = ["student", "cat"];
		var table = PlannerUtility.initializeMemoryTable(kb, space);
		var mentionHeightAction = kb.action_list[PlannerUtility.fetchActionIndex(kb.action_list, "mentionheight")];
		var feedAction = kb.action_list[PlannerUtility.fetchActionIndex(kb.action_list, "feed")];
		it("height should be visible on student1 only after executing the mentionheight.", function() {
			Assert(PlannerUtility.assertionIsTrue(kb, {	truth: false, predicate: "visible", parameters: ["student1", "height*"]	}));
			PlannerUtility.executeAction(kb, mentionHeightAction, ["student1"]);
			Assert(PlannerUtility.assertionIsTrue(kb, { truth: true, predicate: "visible", parameters: ["student1", "height*"] }));
			var list = PlannerUtility.getAvailableActions(kb, table);
			var counter = 0;
			for (var i = 0; i < list.length; i++) {
				if (list[i].action.name == "mentionheight") {
					counter++;
				}
			}
			Assert(counter == 1);
		});
		it("pet should not be hungry after applying the feed action", function() {
			PlannerUtility.addAssertion(kb, { truth: true, predicate: "hungry", parameters: ["cat2"]});
			PlannerUtility.addAssertion(kb, { truth: true, predicate: "owns", parameters: ["student1", "cat2"]});
			Assert(PlannerUtility.assertionIsTrue(kb, { truth: true, predicate: "hungry", parameters: ["cat2"]}));
			PlannerUtility.executeAction(kb, feedAction, ["student1", "cat2"]);
			Assert(PlannerUtility.assertionIsTrue(kb, { truth: false, predicate: "hungry", parameters: ["cat2"]}));
		});
	});
});