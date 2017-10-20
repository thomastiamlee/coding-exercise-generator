const Assert = require("assert");
const Component = require("../src/component");
const Restriction = require("../src/restriction");

describe("operand", function() {
  describe("#validate()", function() {
    describe("Number restrictions", function() {
			var r1 = Object.create(Restriction.RESTRICTION_SMALL_NUMBER);
			var r2 = Object.create(Restriction.RESTRICTION_SMALL_NUMBER_POSITIVE);
			var r3 = Object.create(Restriction.RESTRICTION_SMALL_NUMBER_NONZERO);
			var o1 = new Component.operand("number", -100);
			var o2 = new Component.operand("number", 0);
			var o3 = new Component.operand("number", 100);
			var o4 = new Component.operand("number", -101);
			var o5 = new Component.operand("number", 101);
			var o6 = new Component.operand("string", "hello");
				
			it("-100 should pass as a small number.", function() { Assert(o1.validate(r1)); });
			it("-101 should fail as a small number.", function() { Assert(!o4.validate(r1)); });
			it("100 should pass as a small number.", function() { Assert(o3.validate(r1)); });
			it("101 should fail as a small number.", function() { Assert(!o5.validate(r1)); });
			it("0 should pass as a small number.", function() { Assert(o2.validate(r1)); });
			
			it("-100 should fail as a small positive number.", function() { Assert(!o1.validate(r2)); });
			it("-101 should fail as a small positive number.", function() { Assert(!o4.validate(r2)); });
			it("100 should pass as a small positive number.", function() { Assert(o3.validate(r2)); });
			it("101 should fail as a small positive number.", function() { Assert(!o5.validate(r2)); });
			it("0 should fail as a small positive number.", function() { Assert(!o2.validate(r2)); });
			
			it("-100 should pass as a small nonzero number.", function() { Assert(o1.validate(r3)); });
			it("-101 should fail as a small nonzero number.", function() { Assert(!o4.validate(r3)); });
			it("100 should pass as a small nonzero number.", function() { Assert(o3.validate(r3)); });
			it("101 should fail as a small nonzero number.", function() { Assert(!o5.validate(r3)); });
			it("0 should fail as a small nonzero number.", function() { Assert(!o2.validate(r3)); });
		});
  });
});