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
});