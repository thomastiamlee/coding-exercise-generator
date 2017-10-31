const Assert = require("assert");
const Reader = require("../src/reader");
const Component = require("../src/component");
		
describe("reader", function() {
	describe("#loadExercise()", function() {
		describe("Basic test case 1", function() {
			var result = Reader.loadExercise("./test/sample/sample1.exc");
			it("Evaluating the structure with an input of 2 and 6 should result in 0.", function() {
				var var1 = result.input[0];
				var var2 = result.input[1];
				var res = result.head.evaluateStructure([{variable: var1, value: 2}, {variable: var2, value: 6}]);
				Assert(res instanceof Component.operand && res.type == "number" && res.value == 0.0);
			});
			it("Evaluating the structure with an input of 2 and 10 should result in 10.", function() {
				var var1 = result.input[0];
				var var2 = result.input[1];
				var res = result.head.evaluateStructure([{variable: var1, value: 2}, {variable: var2, value: 10}]);
				Assert(res instanceof Component.operand && res.type == "number" && res.value == 10.0);
			});
			it("Evaluating the structure with an input of 3 and 15 should result in 12.", function() {
				var var1 = result.input[0];
				var var2 = result.input[1];
				var res = result.head.evaluateStructure([{variable: var1, value: 3}, {variable: var2, value: 15}]);
				Assert(res instanceof Component.operand && res.type == "number" && res.value == 12.0);
			});
			it("Evaluating the structure with an input of 3 and 10 should result in 0.", function() {
				var var1 = result.input[0];
				var var2 = result.input[1];
				var res = result.head.evaluateStructure([{variable: var1, value: 3}, {variable: var2, value: 10}]);
				Assert(res instanceof Component.operand && res.type == "number" && res.value == 0.0);
			});
		});
		describe("Basic test case 2", function() {
			var result = Reader.loadExercise("./test/sample/sample2.exc");
			it("Evaluating the structure with an input of 70, 80, 90 should result in 1.", function() {
				var var1 = result.input[0];
				var var2 = result.input[1];
				var var3 = result.input[2];
				var res = result.head.evaluateStructure([{variable: var1, value: 70}, {variable: var2, value: 80}, {variable: var3, value: 90}]);
				Assert(res instanceof Component.operand && res.type == "number" && res.value == 1.0);
			});
			it("Evaluating the structure with an input of 60, 70, 80 should result in 1.", function() {
				var var1 = result.input[0];
				var var2 = result.input[1];
				var var3 = result.input[2];
				var res = result.head.evaluateStructure([{variable: var1, value: 60}, {variable: var2, value: 70}, {variable: var3, value: 80}]);
				Assert(res instanceof Component.operand && res.type == "number" && res.value == 1.0);
			});
			it("Evaluating the structure with an input of 60, 60, 80 should result in 0.", function() {
				var var1 = result.input[0];
				var var2 = result.input[1];
				var var3 = result.input[2];
				var res = result.head.evaluateStructure([{variable: var1, value: 60}, {variable: var2, value: 60}, {variable: var3, value: 80}]);
				Assert(res instanceof Component.operand && res.type == "number" && res.value == 0.0);
			});
			it("Evaluating the structure with an input of 0, 0, 100 should result in 0.", function() {
				var var1 = result.input[0];
				var var2 = result.input[1];
				var var3 = result.input[2];
				var res = result.head.evaluateStructure([{variable: var1, value: 0}, {variable: var2, value: 0}, {variable: var3, value: 100}]);
				Assert(res instanceof Component.operand && res.type == "number" && res.value == 0.0);
			});
		});
		describe("Loop test case", function() {
			var result = Reader.loadExercise("./test/sample/sample3.exc");
			it("Evaluating the structure with an input of 1 should result in 1.", function() {
				var var1 = result.input[0];
				var res = result.head.evaluateStructure([{variable: var1, value: 1}]);
				Assert(res instanceof Component.operand && res.type == "number" && res.value == 1.0);
			});
			it("Evaluating the structure with an input of 3 should result in 6.", function() {
				var var1 = result.input[0];
				var res = result.head.evaluateStructure([{variable: var1, value: 3}]);
				Assert(res instanceof Component.operand && res.type == "number" && res.value == 6.0);
			});
			it("Evaluating the structure with an input of 5 should result in 120.", function() {
				var var1 = result.input[0];
				var res = result.head.evaluateStructure([{variable: var1, value: 5}]);
				Assert(res instanceof Component.operand && res.type == "number" && res.value == 120.0);
			});
			it("Evaluating the structure with an input of 0 should result in 1.", function() {
				var var1 = result.input[0];
				var res = result.head.evaluateStructure([{variable: var1, value: 0}]);
				Assert(res instanceof Component.operand && res.type == "number" && res.value == 1.0);
			});
		});
	});
});