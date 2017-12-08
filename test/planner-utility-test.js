const Assert = require("assert");
const PlannerUtility = require("../src/planner-utility");
const Parser = require("../src/parser");

describe("planner-utility", function() {
	describe("Space entity function", function() {
		describe("#attachLocalEntity()", function() {
			it("height2 should be attached to person1", function() {
				var parent1 = new PlannerUtility.entity("person", [], "global");
				var parent2 = new PlannerUtility.entity("height", [], "global");
				var entity1 = new PlannerUtility.entity("person1", [parent1], "local");
				var entity2 = new PlannerUtility.entity("height2", [parent2], "local");
				entity1.attachLocalEntity(entity2, "height");
				Assert(entity1.attachments.length == 1 && entity1.attachments[0].obj.name == "height2");
			});
			it("height should not be attached to person1 because it is in the global space.", function() {
				var parent1 = new PlannerUtility.entity("person", [], "global");
				var entity1 = new PlannerUtility.entity("person1", [parent1], "local");
				var entity2 = new PlannerUtility.entity("height", [], "global");
				entity1.attachLocalEntity(entity2, "height");
				Assert(entity1.attachments.length == 0);
			});
			it("height2 should be replaced with height3", function() {
				var parent1 = new PlannerUtility.entity("person", [], "global");
				var parent2 = new PlannerUtility.entity("height", [], "global");
				var entity1 = new PlannerUtility.entity("person1", [parent1], "local");
				var entity2 = new PlannerUtility.entity("height2", [parent2], "local");
				var entity3 = new PlannerUtility.entity("height3", [parent2], "local");
				entity1.attachLocalEntity(entity2, "height");
				entity1.attachLocalEntity(entity3, "height");
				Assert(entity1.attachments.length == 1 && entity1.attachments[0].obj.name == "height3");
			});
		});
		describe("#getAttachedLocalEntity()", function() {
			it("Finding the height of person1 should return the height2 entity", function() {
				var parent1 = new PlannerUtility.entity("person", [], "global");
				var parent2 = new PlannerUtility.entity("height", [], "global");
				var entity1 = new PlannerUtility.entity("person1", [parent1], "local");
				var entity2 = new PlannerUtility.entity("height2", [parent2], "local");
				entity1.attachLocalEntity(entity2, "height");
				Assert(entity1.getAttachedLocalEntity("height").name == "height2");
			});
			it("Finding the height of person1 should return the height3 entity", function() {
				var parent1 = new PlannerUtility.entity("person", [null], "global");
				var parent2 = new PlannerUtility.entity("height", [null], "global");
				var entity1 = new PlannerUtility.entity("person1", [parent1], "local");
				var entity2 = new PlannerUtility.entity("height2", [parent2], "local");
				var entity3 = new PlannerUtility.entity("height3", [parent2], "local");
				entity1.attachLocalEntity(entity2, "height");
				entity1.attachLocalEntity(entity3, "height");
				Assert(entity1.getAttachedLocalEntity("height").name == "height3");
			});
		});
		describe("#removeAttachedLocalEntity()", function() {
			it("The height entity should be removed.", function() {
				var parent1 = new PlannerUtility.entity("person", [null], "global");
				var parent2 = new PlannerUtility.entity("height", [null], "global");
				var entity1 = new PlannerUtility.entity("person1", [parent1], "local");
				var entity2 = new PlannerUtility.entity("height2", [parent2], "local");
				entity1.attachLocalEntity(entity2, "height");
				entity1.removeAttachedLocalEntity("height");
				Assert(entity1.attachments.length == 0);
			});
			it("The height entity should be removed.", function() {
				var parent1 = new PlannerUtility.entity("person", [null], "global");
				var parent2 = new PlannerUtility.entity("height", [null], "global");
				var parent3 = new PlannerUtility.entity("weight", [null], "global");
				var entity1 = new PlannerUtility.entity("person1", [parent1], "local");
				var entity2 = new PlannerUtility.entity("height2", [parent2], "local");
				var entity3 = new PlannerUtility.entity("weight3", [parent3], "local");
				entity1.attachLocalEntity(entity2, "height");
				entity1.attachLocalEntity(entity3, "weight");
				entity1.removeAttachedLocalEntity("height");
				Assert(entity1.attachments.length == 1 && entity1.attachments[0].name == "weight");
			});
		});
		describe("#isExtendedFrom()", function() {
			var kb = Parser.parseKnowledgeBase("./test/kbextendtest.txt");
			var table = new PlannerUtility.memory();
			var parent1 = kb.getGlobalEntity("student");
			var parent2 = kb.getGlobalEntity("dog");
			table.createLocalEntity([parent1, parent2]);
			var child1 = table.getLocalEntity("student1");
			var child2 = table.getLocalEntity("dog1");
			var test1 = kb.getGlobalEntity("student").isExtendedFrom(kb.getGlobalEntity("person"));
			var test2 = kb.getGlobalEntity("student").isExtendedFrom(kb.getGlobalEntity("student"));
			var test3 = kb.getGlobalEntity("person").isExtendedFrom(kb.getGlobalEntity("student"));
			var test4 = kb.getGlobalEntity("spaghetti").isExtendedFrom(kb.getGlobalEntity("object"));
			var test5 = kb.getGlobalEntity("dog").isExtendedFrom(kb.getGlobalEntity("animal"));
			var test6 = kb.getGlobalEntity("dog").isExtendedFrom(kb.getGlobalEntity("cat"));
			var test7 = kb.getGlobalEntity("bulldog").isExtendedFrom(kb.getGlobalEntity("cat"));
			var test8 = kb.getGlobalEntity("distancevalue").isExtendedFrom(kb.getGlobalEntity("nonnegativevalue"));
			var test9 = child1.isExtendedFrom(kb.getGlobalEntity("person"));
			var test10 = child2.isExtendedFrom(kb.getGlobalEntity("person"));
			var test11 = kb.getGlobalEntity("bulldog").isExtendedFrom(kb.getGlobalEntity("scary"));
			var test12 = child2.isExtendedFrom(kb.getGlobalEntity("scary"));
			it ("student is an offspring of the person.", function() { Assert(test1);	});
			it ("student is an offspring of the student.", function() {	 Assert(test2); });
			it ("person is not an offspring of the student.", function() { Assert(!test3); });
			it ("spaghetti is an offspring of the object.", function() { Assert(test4); });
			it ("dog is an offspring of the animal.", function() { Assert(test5); });
			it ("dog is not an offspring of the cat.", function() { Assert(!test6); });
			it ("bulldog is not an offspring of the cat.", function() { Assert(!test7); });
			it ("distancevalue* is an offspring of the nonnegativevalue*.", function() { Assert(test8); });
			it ("student1 is an offspring of person.", function() { Assert(test9); });
			it ("dog1 is not an offspring of person.", function() { Assert(!test10); });
			it ("bully is an offspring of scary.", function() { Assert(test11); });
			it ("dog1 is not an offspring of scary.", function() { Assert(!test12); });
		});
	});
	describe("Memory functions", function() {
		describe("#getLocalEntity()", function() {
			var parent1 = new PlannerUtility.entity("person", [null], "global", true);
			var parent2 = new PlannerUtility.entity("height", [null], "global");
			var parent3 = new PlannerUtility.entity("weight", [null], "global");
			var entity1 = new PlannerUtility.entity("person1", [parent1], "local");
			var entity2 = new PlannerUtility.entity("height1", [parent2], "local");
			var entity3 = new PlannerUtility.entity("weight1", [parent3], "local");
			var memory = new PlannerUtility.memory();
			memory.localEntities["person1"] = entity1;
			memory.localEntities["height1"] = entity2;
			memory.localEntities["weight1"] = entity3;
			it("person1 should be found.", function() {
				Assert(memory.getLocalEntity("person1") instanceof PlannerUtility.entity);
			});
			it("height1 should be found.", function() {
				Assert(memory.getLocalEntity("height1") instanceof PlannerUtility.entity);
			});
			it("weight should not be found", function() {
				Assert(memory.getLocalEntity("weight") == null);
			})
		});
		describe("#createNewLocalEntity()", function() {
			it("It should be possible to create a local entity from person.", function() {
				var parent1 = new PlannerUtility.entity("person", [null], "global");
				var table = new PlannerUtility.memory();
				table.createLocalEntity(parent1);
				Assert(table.getLocalEntity("person1") instanceof PlannerUtility.entity);
				Assert(table.getLocalEntity("person1").type == "local");
			});
			it("It should be possible to create two local entities from restaurant.", function() {
				var parent1 = new PlannerUtility.entity("restaurant", [null], "global");
				var table = new PlannerUtility.memory();
				table.createLocalEntity(parent1);
				table.createLocalEntity(parent1);
				Assert(table.getLocalEntity("restaurant1") instanceof PlannerUtility.entity);
				Assert(table.getLocalEntity("restaurant1").type == "local");
				Assert(table.getLocalEntity("restaurant2") instanceof PlannerUtility.entity);
				Assert(table.getLocalEntity("restaurant2").type == "local");
			});
			it("It should be possible to create local entities from an array", function() {
				var parent1 = new PlannerUtility.entity("food", [null], "global");
				var parent2 = new PlannerUtility.entity("fruit", [null], "global");
				table = new PlannerUtility.memory();
				table.createLocalEntity([parent1, parent1, parent2]);
				Assert(table.getLocalEntity("food1") instanceof PlannerUtility.entity);
				Assert(table.getLocalEntity("food2") instanceof PlannerUtility.entity);
				Assert(table.getLocalEntity("fruit1") instanceof PlannerUtility.entity);
			});
		});
		describe("#assert()", function() {
			var kb = Parser.parseKnowledgeBase("./test/kbmatchtext.txt");
			var table = new PlannerUtility.memory();
			table.createLocalEntity([kb.getGlobalEntity("student"), kb.getGlobalEntity("person"), kb.getGlobalEntity("dog"), kb.getGlobalEntity("cat"), kb.getGlobalEntity("pet")]);
			var query1 = new PlannerUtility.assertionQuery(true, "hungry", [table.getLocalEntity("dog1")]);
			table.assert(query1);
			var query2 = new PlannerUtility.assertionQuery(true, "owns", [table.getLocalEntity("student1"), table.getLocalEntity("dog1")]);
			table.assert(query2);
			var query3 = new PlannerUtility.assertionQuery(true, "favorite", [table.getLocalEntity("person1"), table.getLocalEntity("dog1")]);
			table.assert(query3);
			var query4 = new PlannerUtility.assertionQuery(false, "favorite", [table.getLocalEntity("person1"), table.getLocalEntity("dog1")]);
			table.assert(query4);

			it("The relationship hungry(dog1) should have been added.", function() {
				var query = new PlannerUtility.assertionQuery(true, "hungry", [table.getLocalEntity("dog1")]);
				Assert(PlannerUtility.checkAssertion(kb, table, query));
			});
			it("The relationship owns(student1 dog1) should have been added.", function() {
				var query = new PlannerUtility.assertionQuery(true, "owns", [table.getLocalEntity("student1"), table.getLocalEntity("dog1")]);
				Assert(PlannerUtility.checkAssertion(kb, table, query));
			});
			it("The relationship bestfriend(person1 dog1) should have been removed.", function() {
				var query = new PlannerUtility.assertionQuery(true, "favorite", [table.getLocalEntity("person1"), table.getLocalEntity("dog1")]);
				Assert(!PlannerUtility.checkAssertion(kb, table, query));
			});
		});
/*
		describe("#addSpace()", function() {
			it("Space entity property should be correctly added.", function() {
				table = new PlannerUtility.memory();
				table.addSpace("height*", "person1");
				Assert(table.space.length == 1 && table.space[0][0] == "person1.height*" && table.space[0][1].length == 1 && table.space[0][1][0] == "height*");
			});
			it("It should be possible to add space entities in an array", function() {
				table = new PlannerUtility.memory();
				table.addSpace(["height*", "weight*"], ["person1", "person1"]);
				Assert(table.space.length == 2 && table.space[0][0] == "person1.height*" && table.space[0][1].length == 1 && table.space[0][1][0] == "height*" && table.space[1][0] == "person1.weight*" && table.space[1][1].length == 1 && table.space[1][1][0] == "weight*");
			});
		});
		describe("#addAssertion()", function() {
			var kb = Parser.parseKnowledgeBase("./test/kbmatchtext.txt");
			var space = ["student", "person", "dog", "cat", "pet"];
			var table = new PlannerUtility.memory();
			table.addSpaceFromType(space);
			table.addAssertion({ truth: true, predicate: "hungry", parameters: ["dog3"]});
			table.addAssertion({ truth: true, predicate: "owns", parameters: ["student1", "dog3"]});
			table.addAssertion({ truth: true, predicate: "bestfriend", parameters: ["person2", "dog"]});
			table.addAssertion({ truth: false, predicate: "bestfriend", parameters: ["person2", "dog"]});
			var assertionList = table.assertions;
			it("The relationship hungry(dog3) should have been added", function() {
				var found = false;
				for (var i = 0; i < assertionList.length; i++) {
					var current = assertionList[i];
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
				for (var i = 0; i < assertionList.length; i++) {
					var current = assertionList[i];
					if (current.predicate == "owns") {
						if (current.parameters.length == 2 && current.parameters[0] == "student1" && current.parameters[1] == "dog3") {
							found = true;
							break;
						}
					}
				}
				Assert(found);
			});
			it("The relationship bestfriend(person2 dog) should have been removed", function() {
				var found = false;
				for (var i = 0; i < assertionList.length; i++) {
					var current = assertionList[i];
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
		*/
	});
	describe("#checkAssertion()", function() {
		var kb = Parser.parseKnowledgeBase("./test/kbmatchtext.txt");
		var table = new PlannerUtility.memory();
		table.createLocalEntity([kb.getGlobalEntity("student"), kb.getGlobalEntity("person"), kb.getGlobalEntity("dog"), kb.getGlobalEntity("cat"), kb.getGlobalEntity("pet")]);
		var assertion1 = new PlannerUtility.assertionQuery(true, "has", [kb.getGlobalEntity("person"), kb.getGlobalEntity("height")]);
		var test1 = PlannerUtility.checkAssertion(kb, table, assertion1);
		var assertion2 = new PlannerUtility.assertionQuery(true, "has", [kb.getGlobalEntity("student"), kb.getGlobalEntity("height")]);
		var test2 = PlannerUtility.checkAssertion(kb, table, assertion2);
		var assertion3 = new PlannerUtility.assertionQuery(false, "has", [kb.getGlobalEntity("person"), kb.getGlobalEntity("height")]);
		var test3 = PlannerUtility.checkAssertion(kb, table, assertion3);
		var assertion4 = new PlannerUtility.assertionQuery(false, "has", [kb.getGlobalEntity("student"), kb.getGlobalEntity("height")]);
		var test4 = PlannerUtility.checkAssertion(kb, table, assertion4);
		var assertion5 = new PlannerUtility.assertionQuery(true, "has", [table.getLocalEntity("student1"), kb.getGlobalEntity("height")]);
		var test5 = PlannerUtility.checkAssertion(kb, table, assertion5);
		var assertion6 = new PlannerUtility.assertionQuery(true, "canown", [table.getLocalEntity("person1"), table.getLocalEntity("pet1")]);
		var test6 = PlannerUtility.checkAssertion(kb, table, assertion6);
		var assertion7 = new PlannerUtility.assertionQuery(true, "has", [table.getLocalEntity("person1"), kb.getGlobalEntity("height")]);
		var test7 = PlannerUtility.checkAssertion(kb, table, assertion3);
		var assertion8 = new PlannerUtility.assertionQuery(false, "bestfriend", [table.getLocalEntity("student1"), table.getLocalEntity("dog1")]);
		var test8 = PlannerUtility.checkAssertion(kb, table, assertion8);
		var assertion9 = new PlannerUtility.assertionQuery(true, "hungry", [table.getLocalEntity("dog1")]);
		var test9 = PlannerUtility.checkAssertion(kb, table, assertion3);
		it("has(person height) should be true.", function() { Assert(test1); });
		it("has(student height*) should be true.", function() { Assert(test2); });
		it("!has(person height*) should be false.", function() { Assert(!test3); });
		it("!has(student height*) should be false.", function() { Assert(!test4); });
		it("has(student1 height*) should be true.", function() { Assert(test5); });
		it("canown(person2 pet5) should be true.", function() { Assert(test6); });
		it("has(pet5 height*) should be false.", function() { Assert(!test7); });
		it("!bestfriend(student1 dog3) should be false.", function() { Assert(!test8); });
		it("hungry(dog3) should be false.", function() { Assert(!test9); });
	});
	describe("#getAllPossibleParameterMatches()", function() {
		var kb = Parser.parseKnowledgeBase("./test/kbmatchtext.txt");
		var table = new PlannerUtility.memory();
		table.createLocalEntity([kb.getGlobalEntity("student"), kb.getGlobalEntity("person"), kb.getGlobalEntity("dog"), kb.getGlobalEntity("cat"), kb.getGlobalEntity("pet")]);
		var feedAction = kb.getAction("feed");
		var test = PlannerUtility.getAllPossibleParameterMatches(kb, table, feedAction);
		it("In the feed action, student1 and person1 should match the person parameter.", function() {
			Assert(test[0].length == 2);
			Assert(test[0].indexOf(table.getLocalEntity("person1")) != -1);
			Assert(test[0].indexOf(table.getLocalEntity("student1")) != -1);
		});
		it("In the feed action, dog1, cat1 and pet1 should match the pet parameter.", function() {
			Assert(test[1].length == 3);
			Assert(test[1].indexOf(table.getLocalEntity("dog1")) != -1);
			Assert(test[1].indexOf(table.getLocalEntity("cat1")) != -1);
			Assert(test[1].indexOf(table.getLocalEntity("pet1")) != -1);
		});
	});
	describe("#getAllPossibleActionVariableReplacements()", function() {
		var kb = Parser.parseKnowledgeBase("./test/kbmatchtext.txt");
		var table = new PlannerUtility.memory();
		table.createLocalEntity([kb.getGlobalEntity("student"), kb.getGlobalEntity("person"), kb.getGlobalEntity("dog"), kb.getGlobalEntity("cat"), kb.getGlobalEntity("pet")]);
		var feedAction = kb.getAction("feed");
		var mentionHeightAction = kb.getAction("mentionheight");

		table.assert(new PlannerUtility.assertionQuery(true, "hungry", [table.getLocalEntity("dog1")]));
		table.assert(new PlannerUtility.assertionQuery(true, "owns", [table.getLocalEntity("student1"), table.getLocalEntity("dog1")]));
		table.assert(new PlannerUtility.assertionQuery(true, "owns", [table.getLocalEntity("student1"), table.getLocalEntity("cat1")]));
		var test1 = PlannerUtility.getAllPossibleActionVariableReplacements(kb, table, feedAction);
		var test2 = PlannerUtility.getAllPossibleActionVariableReplacements(kb, table, mentionHeightAction);
		it("test1 should have one possibility: feed(student1 dog1).", function() {
			Assert(test1.length == 1 && test1[0][0] == table.getLocalEntity("student1") && test1[0][1] == table.getLocalEntity("dog1"));
		});
		it("test2 should have 3 possibilities: mentionheight(student1), mentionheight(person1), and mentionheight(cat1).", function() {
			var x = false, y = false, z = false;
			for (var i = 0; i < test2.length; i++) {
				if (test2[i][0] == table.getLocalEntity("student1")) x = true;
				if (test2[i][0] == table.getLocalEntity("person1")) y = true;
				if (test2[i][0] == table.getLocalEntity("cat1")) z = true;
			}
			Assert(test2.length == 3 && x && y && z);
		});
	});
	describe("#getAvailableActions()", function() {
		var kb1 = Parser.parseKnowledgeBase("./test/kbmatchtext.txt");
		var table1 = new PlannerUtility.memory();
		table1.createLocalEntity([kb1.getGlobalEntity("student"), kb1.getGlobalEntity("student")]);
		var availableActions1 = PlannerUtility.getAvailableActions(kb1, table1);
		var kb2 = Parser.parseKnowledgeBase("./test/kbmatchtext.txt");
		var table2 = new PlannerUtility.memory();
		table2.createLocalEntity([kb2.getGlobalEntity("person"), kb2.getGlobalEntity("cat")]);
		table2.assert(new PlannerUtility.assertionQuery(true, "owns", [table2.getLocalEntity("person1"), table2.getLocalEntity("cat1")]));
		table2.assert(new PlannerUtility.assertionQuery(true, "hungry", [table2.getLocalEntity("cat1")]));
		var availableActions2 = PlannerUtility.getAvailableActions(kb2, table2);
		it("In space1, there should be 4 available actions.", function() {
			Assert(availableActions1.length == 4);
		});
		it("In space1, there should be an action for mentioning the height of student1 and student2 and comparing their heights.", function() {
			var x1 = false, x2 = false, x3 = false, x4 = false;
			for (var i = 0; i < availableActions1.length; i++) {
				if (availableActions1[i].action.name == "mentionheight" && availableActions1[i].parameters[0] == table1.getLocalEntity("student1")) x1 = true;
				if (availableActions1[i].action.name == "mentionheight" && availableActions1[i].parameters[0] == table1.getLocalEntity("student2")) x2 = true;
				if (availableActions1[i].action.name == "gettaller" && availableActions1[i].parameters[0] == table1.getLocalEntity("student1") && availableActions1[i].parameters[1] == table1.getLocalEntity("student2")) x3 = true;
				if (availableActions1[i].action.name == "gettaller" && availableActions1[i].parameters[0] == table1.getLocalEntity("student2") && availableActions1[i].parameters[1] == table1.getLocalEntity("student1")) x4 = true;
			}
			Assert(x1 && x2 && x3 && x4);
		});
		it("In space2, there should be 3 available actions.", function() {
			Assert(availableActions2.length == 3);
		});
		it("In space2, there should be an action for mentioning the height of student1 and cat2, as well as person1 feeding cat2.", function() {
			var x1 = false, x2 = false, x3 = false;;
			for (var i = 0; i < availableActions2.length; i++) {
				if (availableActions2[i].action.name == "mentionheight" && availableActions2[i].parameters[0] == table2.getLocalEntity("cat1")) x1 = true;
				if (availableActions2[i].action.name == "mentionheight" && availableActions2[i].parameters[0] == table2.getLocalEntity("cat1")) x2 = true;
				if (availableActions2[i].action.name == "feed" && availableActions2[i].parameters[0] == table2.getLocalEntity("person1") && availableActions2[i].parameters[1] == table2.getLocalEntity("cat1")) x3 = true;
			}
			Assert(x1 && x2 && x3);
		});
	});

/*





	describe("#executeAction()", function() {
		var kb = Parser.parseKnowledgeBase("./test/kbmatchtext.txt");
		var space = ["student", "cat"];
		var table = new PlannerUtility.memory();
		table.addSpaceFromType(space);
		var mentionHeightAction = kb.action_list[PlannerUtility.fetchActionIndex(kb.action_list, "mentionheight")];
		var feedAction = kb.action_list[PlannerUtility.fetchActionIndex(kb.action_list, "feed")];
		it("height should be visible on student1 only after executing the mentionheight, and the student1.height entity should be added after.", function() {
			Assert(PlannerUtility.assertionIsTrue(kb, table, {	truth: false, predicate: "visible", parameters: ["student1", "height*"]	}));
			PlannerUtility.executeAction(kb, table, mentionHeightAction, ["student1"]);
			Assert(PlannerUtility.assertionIsTrue(kb, table, { truth: true, predicate: "visible", parameters: ["student1", "height*"] }));
			var list = PlannerUtility.getAvailableActions(kb, table);
			var counter = 0;
			for (var i = 0; i < list.length; i++) {
				if (list[i].action.name == "mentionheight") {
					counter++;
				}
			}
			Assert(counter == 1);
			Assert(table.space.length == 3 && table.space[2][0] == "student1.height*");
		});
		it("pet should not be hungry after applying the feed action", function() {
			table.addAssertion({ truth: true, predicate: "hungry", parameters: ["cat2"]});
			table.addAssertion({ truth: true, predicate: "owns", parameters: ["student1", "cat2"]});
			Assert(PlannerUtility.assertionIsTrue(kb, table, { truth: true, predicate: "hungry", parameters: ["cat2"]}));
			PlannerUtility.executeAction(kb, table, feedAction, ["student1", "cat2"]);
			Assert(PlannerUtility.assertionIsTrue(kb, table, { truth: false, predicate: "hungry", parameters: ["cat2"]}));
		});
	});
	*/
});
