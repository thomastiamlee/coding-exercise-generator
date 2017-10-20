const Assert = require("assert");
const Component = require("../src/component");
const Restriction = require("../src/restriction");

describe("node", function() {
  describe("#setOperator()", function() {
		var n1 = new Component.node(Component.NODE_TYPE_OPERATION);
		var n2 = new Component.node(Component.NODE_TYPE_CONDITION);
		n1.setOperator("*");
		n2.setOperator("<");
		
		it("Operation node should set its operator to *.", function() { Assert(n1.operator == "*") });		
		it("Condition node should set its operator to <.", function() { Assert(n2.operator == "<") });		
	});
	
	describe("#evaluateThis()", function() {
    describe("Operation node on numbers", function() {
			var o1 = new Component.operand("number", 5);
			var o2 = new Component.operand("number", -5);
			var o3 = new Component.operand("number", 0);
			var o4 = new Component.operand("number", 6);
			var o5 = new Component.operand("number", 9);
			var n1 = new Component.node(Component.NODE_TYPE_OPERATION);
			n1.setOperator("+");
			var n2 = new Component.node(Component.NODE_TYPE_OPERATION);
			n2.setOperator("-");
			var n3 = new Component.node(Component.NODE_TYPE_OPERATION);
			n3.setOperator("*");
			var n4 = new Component.node(Component.NODE_TYPE_OPERATION);
			n4.setOperator("/");
			
			it("5 + -5 should evaluate to 0.", function() {
				var res = n1.evaluateThis([o1, o2]);
				Assert(res.value == 0 && res.type == "number");
			});
			it("6 - 9 should evaluate to -3.", function() {
				var res = n2.evaluateThis([o4, o5]);
				Assert(res.value == -3 && res.type == "number");
			});
			it("9 * 5 should evaluate to 45.", function() {
				var res = n3.evaluateThis([o5, o1]);
				Assert(res.value == 45 && res.type == "number");
			});
			it("9 / 5 should evaluate to 1.8.", function() {
				var res = n4.evaluateThis([o5, o1]);
				Assert(res.value == 1.8 && res.type == "number");
			});
			it("5 / 0 should throw an error.", function() {
				Assert.throws(function() { n4.evaluateThis([o1,o3]); }, Error);
			});
		});
		describe("Condition node on numbers", function() {
			var o1 = new Component.operand("number", 5);
			var o2 = new Component.operand("number", 5);
			var o3 = new Component.operand("number", 10);
			var o4 = new Component.operand("number", 10);
			var o5 = new Component.operand("number", 9.9);
			var n1 = new Component.node(Component.NODE_TYPE_CONDITION);
			n1.setOperator(">");
			var n2 = new Component.node(Component.NODE_TYPE_CONDITION);
			n2.setOperator(">=");
			var n3 = new Component.node(Component.NODE_TYPE_CONDITION);
			n3.setOperator("<");
			var n4 = new Component.node(Component.NODE_TYPE_CONDITION);
			n4.setOperator("<=");
			var n5 = new Component.node(Component.NODE_TYPE_CONDITION);
			n5.setOperator("==");
			var n6 = new Component.node(Component.NODE_TYPE_CONDITION);
			n6.setOperator("!=");
			
			it("10 == 10 should evaluate to true.", function() {	
				Assert(n5.evaluateThis([o3, o4]) == true);
			});
			it("10 != 10 should evaluate to false.", function() {	
				Assert(n6.evaluateThis([o3, o4]) == false);
			});
			it("10 == 9.9 should evaluate to false.", function() {	
				Assert(n5.evaluateThis([o3, o5]) == false);
			});
			it("10 != 9.9 should evaluate to true.", function() {	
				Assert(n6.evaluateThis([o3, o5]) == true);
			});
			it("5 >= 5 should evaluate to true.", function() {	
				Assert(n2.evaluateThis([o1, o2]) == true);
			});
			it("5 >= 10 should evaluate to false.", function() {	
				Assert(n2.evaluateThis([o1, o3]) == false);
			});
			it("5 > 5 should evaluate to false.", function() {	
				Assert(n1.evaluateThis([o1, o2]) == false);
			});
			it("5 > 10 should evaluate to false.", function() {	
				Assert(n1.evaluateThis([o1, o3]) == false);
			});
			it("10 >= 5 should evaluate to true.", function() {	
				Assert(n2.evaluateThis([o3, o1]) == true);
			});
			it("10 > 5 should evaluate to true.", function() {	
				Assert(n1.evaluateThis([o3, o1]) == true);
			});
			it("5 <= 5 should evaluate to true.", function() {	
				Assert(n4.evaluateThis([o1, o2]) == true);
			});
			it("5 <= 10 should evaluate to true.", function() {	
				Assert(n4.evaluateThis([o1, o3]) == true);
			});
			it("5 < 5 should evaluate to false.", function() {	
				Assert(n3.evaluateThis([o1, o2]) == false);
			});
			it("5 < 10 should evaluate to true.", function() {	
				Assert(n3.evaluateThis([o1, o3]) == true);
			});
			it("10 <= 5 should evaluate to false.", function() {	
				Assert(n4.evaluateThis([o3, o1]) == false);
			});
			it("10 < 5 should evaluate to false.", function() {	
				Assert(n3.evaluateThis([o3, o1]) == false);
			});
		});
  });
});
				