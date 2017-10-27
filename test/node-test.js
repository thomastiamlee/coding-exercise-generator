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
		describe("Return node", function() {
			var o1 = new Component.operand("number", 9);
			var o2 = new Component.operand("string", "neil");
			var n1 = new Component.node(Component.NODE_TYPE_RETURN);
			it("Return node on 10 should return 10.", function() {	Assert(n1.evaluateThis([o1]) == o1);	});
			it("Return node on \"neil\" should return \"neil\".", function() {	Assert(n1.evaluateThis([o2]) == o2);	});
		});
  });
	
	describe("#evaluateStructure()", function() {
		var o1 = new Component.operand("number", 5);
		var o2 = new Component.operand("number", 6);
		var o3 = new Component.operand("number", 8);
		var o4 = new Component.operand("string", "neil");
		var v1 = new Component.variable("number");
		var n1 = new Component.node(Component.NODE_TYPE_RETURN);
		n1.attachInputOperand(v1, 0);
		var n2 = new Component.node(Component.NODE_TYPE_RETURN);
		n2.attachInputOperand(o4, 0);
		var n3 = new Component.node(Component.NODE_TYPE_OPERATION);
		n3.attachInputOperand(o1, 0);
		n3.attachInputOperand(o2, 1);
		n3.setOperator("*");
		n3.attachNode(n1, 0);
		n3.setVariableOutput(v1);
		var n4 = new Component.node(Component.NODE_TYPE_CONDITION);
		n4.attachInputOperand(o2, 0);
		n4.attachInputOperand(o3, 1);
		n4.setOperator("<");
		n4.attachNode(n3, 0);
		n4.attachNode(n2, 1);
		
		it("Evaluating structure at n2 should result to \"neil\".", function() {
			var res = n2.evaluateStructure();
			Assert(res.value == "neil");
			Assert(res.type == "string");
		});
		it("Evaluating structure at n3 should result to 30.", function() {
			var res = n3.evaluateStructure();
			Assert(res.value == 30);
			Assert(res.type == "number");
		});
		it("Evaluating structure at n4 should result to 30.", function() {
			var res = n4.evaluateStructure();
			Assert(res.value == 30);
			Assert(res.type == "number");
		});
	});
	
	describe("#replaceAllPlaceholders()", function() {
		var o1 = new Component.variable("number");
		var o2 = new Component.placeholder(0);
		var o3 = new Component.placeholder(1);
		var o4 = new Component.operand("number", 10);
		var o5 = new Component.operand("number", 10);
		var o6 = new Component.variable("number");
		
		var n1 = new Component.node(Component.NODE_TYPE_OPERATION);
		n1.attachInputOperand(o2, 0);
		n1.attachInputOperand(o4, 1);
		n1.setOperator("+");
		n1.setVariableOutput(o1);
		var n2 = new Component.node(Component.NODE_TYPE_OPERATION);
		n2.attachInputOperand(o5, 0);
		n2.attachInputOperand(o3, 1);
		n2.setOperator("+");
		n2.setVariableOutput(o1);
		var n3 = new Component.node(Component.NODE_TYPE_OPERATION);
		n3.attachInputOperand(o2, 0);
		n3.attachInputOperand(o3, 1);
		n3.setOperator("+");
		n3.setVariableOutput(o1);
		n1.attachNode(n2, 0);
		n2.attachNode(n3, 0);
		
		n1.replaceAllPlaceholders(new Component.operand("number", 5), 0);
		n1.replaceAllPlaceholders(o6, 1);
		
		it("The first operand of n1 should have been replaced with 5.", function() {
			var target = n1.inputOperands[0];
			Assert(target instanceof Component.operand && target.type == "number" && target.value == 5);
		});
		it("The second operand of n1 should have remained 10.", function() {
			var target = n1.inputOperands[1];
			Assert(target instanceof Component.operand && target.type == "number" && target.value == 10);
		});
		it("The first operand of n2 should have remained 10.", function() {
			var target = n2.inputOperands[0];
			Assert(target instanceof Component.operand && target.type == "number" && target.value == 10);
		});
		it("The second operand of n2 should have been replaced with the variable o6.", function() {
			var target = n2.inputOperands[1];
			Assert(target == o6);
		});
		it("The first operand of n3 should have been replaced with 5.", function() {
			var target = n3.inputOperands[0];
			Assert(target instanceof Component.operand && target.type == "number" && target.value == 5);
		});
		it("The second operand of n3 should have been replaced with the variable o6.", function() {
			var target = n3.inputOperands[1];
			Assert(target == o6);
		});
	});
	
	describe("#attachNode(), #attachInputOperand() and #setVariableOutput()", function() {
		describe("Simple block operation node case", function() {
			var o1 = new Component.variable("number");
			var o2 = new Component.variable("number");
			var o3 = new Component.variable("number");
			
			var n1 = new Component.node(Component.NODE_TYPE_OPERATION);
			n1.attachInputOperand(new Component.operand("number", 2), 0);
			n1.attachInputOperand(new Component.operand("number", 3), 1);
			n1.setOperator("+");
			n1.setVariableOutput(o1);
			var n2 = new Component.node(Component.NODE_TYPE_OPERATION);
			n2.attachInputOperand(new Component.placeholder(0), 0);
			n2.attachInputOperand(new Component.placeholder(1), 1);
			n2.setOperator("+");
			n2.setVariableOutput(o2);
			var n3 = new Component.node(Component.NODE_TYPE_OPERATION);
			n3.attachInputOperand(o2, 0);
			n3.attachInputOperand(new Component.operand("number", 2), 1);
			n3.setOperator("/");
			n3.setVariableOutput(new Component.placeholder(-1));
			n2.attachNode(n3, 0);
			var n5 = new Component.node(Component.NODE_TYPE_BLOCK_OPERATION);
			n5.setInternalHead(n2);
			n5.setInternalTerminalNodes([n3]);
			n5.attachInputOperand(o1, 0);
			n5.attachInputOperand(new Component.operand("number", 10), 1);
			n5.setVariableOutput(o3);
			n1.attachNode(n5, 0);
			var n4 = new Component.node(Component.NODE_TYPE_RETURN);
			n4.attachInputOperand(o3, 0);	
			n5.attachNode(n4, 0);
			
			it("n1 should be attached to n5.", function() { Assert(n1.successors[0] == n5); });
			it("n5 should be attached to n4.", function() { Assert(n5.successors[0] == n4); });
			it("n1 should be attached to n2 in the solution path.", function() { Assert(n1.solutionSuccessors[0] == n2); });
			it("n2 should be attached to n3 in the solution path.", function() { Assert(n2.solutionSuccessors[0] == n3); });
			it("n3 should be attached to n4 in the solution path.", function() { Assert(n3.solutionSuccessors[0] == n4); });
			it("evaluating from n1 should result to 7.5.", function() {
				var result = n1.evaluateStructure();
				Assert(result instanceof Component.operand && result.type == "number" && result.value == 7.5);
			});
		});
		describe("Simple block condition node case", function() {
			var o1 = new Component.variable("number");
			var o2 = new Component.variable("number");
			var n1 = new Component.node(Component.NODE_TYPE_OPERATION);
			n1.attachInputOperand(new Component.placeholder(0), 0);
			n1.attachInputOperand(new Component.operand("number", 2), 1);
			n1.setOperator("*");
			n1.setVariableOutput(o1);
			var n2 = new Component.node(Component.NODE_TYPE_CONDITION);
			n2.attachInputOperand(o1, 0);
			n2.attachInputOperand(new Component.operand("number", 10), 1);
			n2.setOperator(">=");
			n1.attachNode(n2, 0);
			var n3 = new Component.node(Component.NODE_TYPE_BLOCK_CONDITION);
			n3.setInternalHead(n1);
			n3.setInternalTerminalNodes([n2]);
			n3.attachInputOperand(o2, 0);
			var n4 = new Component.node(Component.NODE_TYPE_RETURN);
			n4.attachInputOperand(new Component.operand("number", 0), 0);
			n3.attachNode(n4, 0);
			var n5 = new Component.node(Component.NODE_TYPE_RETURN);
			n5.attachInputOperand(o2, 0);
			n3.attachNode(n5, 1);
			
			it("n3 should be attached to n4 and n5.", function() { Assert(n3.successors[0] == n4 && n3.successors[1] == n5); });
			it("n1 should be attached to n2 in the solution path.", function() { Assert(n1.solutionSuccessors[0] == n2); });
			it("n2 should be attached to n4 and n5 in the solution path.", function() { Assert(n2.solutionSuccessors[0] == n4 && n2.solutionSuccessors[1] == n5); });
			it("evaluating from n3 with the input of 4 should result into 4.", function() {
				var result = n3.evaluateStructure([{variable: o2, value: 4}]);
				Assert(result instanceof Component.operand && result.type == "number" && result.value == 4);
			});
			it("evaluating from n3 with the input of 6 should result into 0.", function() {
				var result = n3.evaluateStructure([{variable: o2, value: 6}]);
				Assert(result instanceof Component.operand && result.type == "number" && result.value == 0);
			});
		});
		describe("Loop case", function() {
			var total = new Component.variable("number");
			var input = new Component.variable("number");
			var result = new Component.variable("number");
			var n1 = new Component.node(Component.NODE_TYPE_OPERATION);
			n1.attachInputOperand(new Component.operand("number", 0), 0);
			n1.attachInputOperand(new Component.operand("number", 0), 1);
			n1.setVariableOutput(total);
			n1.setOperator("+");
			var n2 = new Component.node(Component.NODE_TYPE_CONDITION);
			n2.attachInputOperand(new Component.placeholder(0), 0);
			n2.attachInputOperand(new Component.operand("number", 0), 1);
			n2.setOperator(">");
			n1.attachNode(n2, 0);
			var n3 = new Component.node(Component.NODE_TYPE_OPERATION);
			n3.attachInputOperand(total, 0);
			n3.attachInputOperand(new Component.placeholder(0), 1);
			n3.setVariableOutput(total);
			n3.setOperator("+");
			n2.attachNode(n3, 0);
			var n4 = new Component.node(Component.NODE_TYPE_OPERATION);
			n4.attachInputOperand(new Component.placeholder(0), 0);
			n4.attachInputOperand(new Component.operand("number", 1), 1);
			n4.setVariableOutput(new Component.placeholder(0));
			n4.setOperator("-");
			n3.attachNode(n4, 0);
			n4.attachNode(n2, 0);
			var n5 = new Component.node(Component.NODE_TYPE_OPERATION);
			n5.attachInputOperand(total, 0);
			n5.attachInputOperand(new Component.operand("number", 0), 1);
			n5.setVariableOutput(new Component.placeholder(-1));
			n5.setOperator("+");
			n2.attachNode(n5, 1);
			var n6 = new Component.node(Component.NODE_TYPE_BLOCK_OPERATION);
			n6.setInternalHead(n1);
			n6.setInternalTerminalNodes([n5]);
			n6.attachInputOperand(input, 0);
			n6.setVariableOutput(result);
			var n7 = new Component.node(Component.NODE_TYPE_RETURN);
			n7.attachInputOperand(result, 0);
			n6.attachNode(n7, 0);
			
			it("n1 should be attached to n2.", function() { Assert(n1.successors[0] == n2); });
			it("n2 should be attached to n3 and n5.", function() { Assert(n2.successors[0] == n3 && n2.successors[1] == n5); });
			it("n3 should be attached to n4.", function() { Assert(n3.successors[0] == n4); });
			it("n4 should be attached to n2.", function() { Assert(n4.successors[0] == n2); });
			it("n6 should be attached to n7.", function() { Assert(n6.successors[0] == n7); });
			it("n5 should be attached to n7 in the solution path.", function() { Assert(n5.solutionSuccessors[0] == n7); });
			it("evaluating from n6 with an input of 5 should result in 15.", function() {
				var res = n6.evaluateStructure([{variable: input, value: 5}]);
				Assert(res instanceof Component.operand && res.type == "number" && res.value == 15);
			});
			it("evaluating from n6 with an input of 10 should result in 55.", function() {
				var res = n6.evaluateStructure([{variable: input, value: 10}]);
				Assert(res instanceof Component.operand && res.type == "number" && res.value == 55);
			});
		});
		describe("Multiple terminal nodes case", function() {
			var o1 = new Component.variable("number");
			var o2 = new Component.variable("number");
			var o3 = new Component.variable("number");
			var n1 = new Component.node(Component.NODE_TYPE_CONDITION);
			n1.attachInputOperand(new Component.placeholder(0), 0);
			n1.attachInputOperand(new Component.placeholder(1), 1);
			n1.setOperator("<");
			var n2 = new Component.node(Component.NODE_TYPE_OPERATION);
			n2.attachInputOperand(new Component.placeholder(0), 0);
			n2.attachInputOperand(new Component.operand("number", 0), 1);
			n2.setOperator("+");
			n2.setVariableOutput(new Component.placeholder(-1));
			var n3 = new Component.node(Component.NODE_TYPE_OPERATION);
			n3.attachInputOperand(new Component.placeholder(1), 0);
			n3.attachInputOperand(new Component.operand("number", 0), 1);
			n3.setOperator("+");
			n3.setVariableOutput(new Component.placeholder(-1));
			n1.attachNode(n2, 0);
			n1.attachNode(n3, 1);
			var n4 = new Component.node(Component.NODE_TYPE_BLOCK_OPERATION);
			n4.setInternalHead(n1);
			n4.setInternalTerminalNodes([n2, n3]);
			n4.attachInputOperand(o1, 0);
			n4.attachInputOperand(o2, 1);
			n4.setVariableOutput(o3);
			var n5 = new Component.node(Component.NODE_TYPE_RETURN);
			n5.attachInputOperand(o3, 0);
			n4.attachNode(n5, 0);
			
			it("n1 should be attached to n2 and n3.", function() { Assert(n1.successors[0] == n2 && n1.successors[1] == n3); });
			it("n4 should be attached to n5.", function() { Assert(n4.successors[0] == n5); });
			it("n2 and n3 should be attached to n5 in the solution path.", function() { Assert(n2.solutionSuccessors[0] == n5 && n3.solutionSuccessors[0] == n5); });
			it("evaluating from n4 with inputs 2 and 6 should return 2.", function() {
				var res = n4.evaluateStructure([{variable: o1, value: 2}, {variable: o2, value: 6}]);
				Assert(res instanceof Component.operand && res.type == "number" && res.value == 2);
			});
			it("evaluating from n4 with inputs 9.5 and 9 should return 9.", function() {
				var res = n4.evaluateStructure([{variable: o1, value: 9.5}, {variable: o2, value: 9}]);
				Assert(res instanceof Component.operand && res.type == "number" && res.value == 9);
			});			
		});
		describe("Nested blocks case", function() {
			var input = new Component.variable("number");
			// First block
			var o1 = new Component.variable("number");
			var n1 = new Component.node(Component.NODE_TYPE_OPERATION);
			n1.attachInputOperand(new Component.placeholder(0), 0);
			n1.attachInputOperand(new Component.placeholder(1), 1);
			n1.setOperator("+");
			n1.setVariableOutput(o1);
			var n2 = new Component.node(Component.NODE_TYPE_OPERATION);
			n2.attachInputOperand(o1, 0);
			n2.attachInputOperand(new Component.operand("number", 2), 1);
			n2.setOperator("/");
			n2.setVariableOutput(new Component.placeholder(-1));
			n1.attachNode(n2, 0);
			var n3 = new Component.node(Component.NODE_TYPE_BLOCK_OPERATION);
			n3.setInternalHead(n1);
			n3.setInternalTerminalNodes([n2]);
			// Second block
			var o2 = new Component.variable("number");
			var o3 = new Component.variable("number");
			n3.attachInputOperand(new Component.operand("number", 5), 0);
			n3.attachInputOperand(new Component.placeholder(0), 1);
			n3.setVariableOutput(o2);
			var n4 = new Component.node(Component.NODE_TYPE_CONDITION);
			n4.attachInputOperand(o2, 0);
			n4.attachInputOperand(new Component.operand("number", 10), 1);
			n4.setOperator(">");
			n3.attachNode(n4, 0);
			var n5 = new Component.node(Component.NODE_TYPE_BLOCK_CONDITION);
			n5.setInternalHead(n3);
			n5.setInternalTerminalNodes([n4]);
			n5.attachInputOperand(input, 0);
			// Main structure
			var n6 = new Component.node(Component.NODE_TYPE_RETURN);
			n6.attachInputOperand(new Component.operand("number", 1), 0);
			n5.attachNode(n6, 0);
			var n7 = new Component.node(Component.NODE_TYPE_RETURN);
			n7.attachInputOperand(new Component.operand("number", 0), 0);
			n5.attachNode(n7, 1);
			
			it("n1 should be attached to n2.", function() { Assert(n1.successors[0] == n2); });
			it("n3 should be attached to n4.", function() { Assert(n3.successors[0] == n4); });
			it("n5 should be attached to n6 and n7.", function() { Assert(n5.successors[0] == n6 && n5.successors[1] == n7); });
			it("n2 should be attached to n4 in the solution path.", function() { Assert(n2.solutionSuccessors[0] == n4); });
			it("n4 should be attached to n6 and n7 in the solution path.", function() { Assert(n4.solutionSuccessors[0] == n6 && n4.solutionSuccessors[1] == n7); });
			it("evaluating from n5 with input 10 should return 0.", function() {
				var res = n5.evaluateStructure([{variable: input, value: 10}]);
				Assert(res instanceof Component.operand && res.type == "number" && res.value == 0);
			});
			it("evaluating from n5 with input 20 should return 1.", function() {
				var res = n5.evaluateStructure([{variable: input, value: 20}]);
				Assert(res instanceof Component.operand && res.type == "number" && res.value == 1);
			});
			it("evaluating from n5 with input 15 should return 0.", function() {
				var res = n5.evaluateStructure([{variable: input, value: 15}]);
				Assert(res instanceof Component.operand && res.type == "number" && res.value == 0);
			});
		});
	});
});
				