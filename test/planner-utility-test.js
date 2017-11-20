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
		var space = ["person", "restaurant", "ramen"];
		var res = PlannerUtility.initializeMemoryTable(space);
		var invalidSpace = ["person", "height*"];
		var invalidRes = PlannerUtility.initializeMemoryTable(invalidSpace);
		
		it("Memory table should be of length 3.", function() {
			Assert(res.length == 3);
		});
		it("The first element should be {type: \"person\", memory: []]", function() {
			Assert(res[0].type == "person" && res[0].memory.length == 0);
		});
		it("The third element should be {type: \"ramen\", memory: []]", function() {
			Assert(res[2].type == "ramen" && res[2].memory.length == 0);
		});
		it("A space with primitives should return null.", function() {
			Assert(invalidRes == null);
		});
	});
	describe("#fetchTypeIndex()", function() {
		var kb = Parser.parseKnowledgeBase("./test/kbtest.txt");
		PlannerUtility.initializeKnowledgeBase(kb);
		var typeList = kb.type_list;
		var type1 = typeList[PlannerUtility.fetchTypeIndex(typeList, "person")];
		var type2 = typeList[PlannerUtility.fetchTypeIndex(typeList, "stringvalue*")];
		var type3 = typeList[PlannerUtility.fetchTypeIndex(typeList, "food")];
		var type4 = PlannerUtility.fetchTypeIndex(typeList, "banana");
		
		it("type1 should be the person type.", function() {
			Assert(type1.length == 2 && type1[0] == "person" && type1[1] == null);
		});
		it("type2 should be the stringvalue* type.", function() {
			Assert(type2.length == 2 && type2[0] == "stringvalue*" && type2[1] == null);
		});
		it("type3 should be the food type.", function() {
			Assert(type3.length == 2 && type3[0] == "food" && type3[1] == "object");
		});
		it("type4 does not exist and should be -1", function() {
			Assert(type4 == -1);
		});
	});
});