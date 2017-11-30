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
			it("Symbol list should contain 4 elements.", function() {
				Assert(result.symbols.length == 4);
			});
			it("Symbol list should contain x1, x2, i1, and i2", function() {
				var list = ["x1", "x2", "i1", "i2"];
				var names = [];
				var symbols = result.symbols;
				for (var i = 0; i < symbols.length; i++) {
					names.push(symbols[i].name);
				}
				for (var i = 0; i < names.length; i++) {
					if (list.indexOf(names[i]) != -1) {
						list.splice(list.indexOf(names[i]), 1);
					}
				}
				Assert(list.length == 0);
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
			it("Symbol list should contain 6 elements.", function() {
				Assert(result.symbols.length == 6);
			});
			it("Symbol list should contain x, y, z, temp, total, and average", function() {
				var list = ["x", "y", "z", "temp", "total", "average"];
				var names = [];
				var symbols = result.symbols;
				for (var i = 0; i < symbols.length; i++) {
					names.push(symbols[i].name);
				}
				for (var i = 0; i < names.length; i++) {
					if (list.indexOf(names[i]) != -1) {
						list.splice(list.indexOf(names[i]), 1);
					}
				}
				Assert(list.length == 0);
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
			it("Symbol list should contain 2 elements.", function() {
				Assert(result.symbols.length == 2);
			});
			it("Symbol list should contain n and total", function() {
				var list = ["n", "total"];
				var names = [];
				var symbols = result.symbols;
				for (var i = 0; i < symbols.length; i++) {
					names.push(symbols[i].name);
				}
				for (var i = 0; i < names.length; i++) {
					if (list.indexOf(names[i]) != -1) {
						list.splice(list.indexOf(names[i]), 1);
					}
				}
				Assert(list.length == 0);
			});
		});
	});
	describe("#loadBlocks()", function() {
		var storage = [];
		Reader.loadBlocks("./test/sample/block1.blo", storage);
		it("2 blocks should have been loaded.", function() { Assert(storage.length == 2);	});
		it("The first block should be the average block.", function() {
			var target = storage[0];
			Assert(target.name == "average2");
			Assert(target.type == "o");
			Assert(target.blockInputInformation.length == 2);
			Assert(target.blockInputInformation[0] == "number" && target.blockInputInformation[1] == "number");
			Assert(target.variableInformation.length == 1);
			Assert(target.variableInformation[0] == "total-number");
			Assert(target.nodeInformation.length == 2);
			Assert(target.nodeInformation[0] == "o,/0/,/1/,[total],+,1");
			Assert(target.nodeInformation[1] == "@o,[total],(number-2),/blockoutput/,/");
		});
		it("The second block should be the absolute value block.", function() {
			var target = storage[1];
			Assert(target.name == "absolute");
			Assert(target.type == "o");
			Assert(target.blockInputInformation.length == 1);
			Assert(target.blockInputInformation[0] == "number");
			Assert(target.variableInformation.length == 0);
			Assert(target.nodeInformation.length == 3);
			Assert(target.nodeInformation[0] == "c,/0/,(number-0),<,1,2");
			Assert(target.nodeInformation[1] == "@o,/0/,(number--1),/blockoutput/,*");
			Assert(target.nodeInformation[2] == "@o,/0/,(number-0),/blockoutput/,+");			
		});
	});
	describe("#buildBlockFromInformation()", function() {
		var result = new Component.variable("number");
		var storage = [];
		Reader.loadBlocks("./test/sample/block1.blo", storage);
		
		it ("The average block should fit seamleassly into a structure", function() {
			var block1 = Reader.buildBlockFromInformation("average2", storage);
			block1.attachInputOperand(new Component.operand("number", 5), 0);
			block1.attachInputOperand(new Component.operand("number", 10), 1);
			block1.setVariableOutput(result);
			var returnNode = new Component.node(Component.NODE_TYPE_RETURN);
			returnNode.attachInputOperand(result, 0);
			block1.attachNode(returnNode, 0);
			var res = block1.evaluateStructure();
			Assert(res instanceof Component.operand && res.type == "number" && res.value == 7.5);
		});
		it ("The absolute value block should fit seamleassly into a structure", function() {
			var block2 = Reader.buildBlockFromInformation("absolute", storage);
			block2.attachInputOperand(new Component.operand("number", -5), 0);
			block2.setVariableOutput(result);
			var returnNode = new Component.node(Component.NODE_TYPE_RETURN);
			returnNode.attachInputOperand(result, 0);
			block2.attachNode(returnNode, 0);
			var res = block2.evaluateStructure();
			Assert(res instanceof Component.operand && res.type == "number" && res.value == 5);
		});
	});
});