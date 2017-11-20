const Assert = require("assert");
const PlannerUtility = require("../src/planner-utility");

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
});