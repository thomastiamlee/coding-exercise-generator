const Assert = require("assert");
const Reader = require("../src/reader");
		
describe("reader", function() {
	describe("#loadBlocks", function() {
		var result = [];
		Reader.loadBlocks("test/block-directory", result);
		it("block list should have a length of 2.", function() { Assert(result.length == 2); });
		it("first block should be the average block", function() {
			var target = result[0];
			Assert(target.name == "average2");
			Assert(target.description == "get the average of 2 numbers");
			Assert(target.blockType == "o");
			Assert(target.inputDataTypes.length == 2 && target.inputDataTypes[0] == "n" && target.inputDataTypes[1] == "n");
			Assert(target.internalNodesData[0] == "o,v-n-total,i-0,i-1,+,1");
			Assert(target.internalNodesData[1] == "o,output,v-total,c-n-2,/,terminal");
		});
		it("second block should be the absolute value block", function() {
			var target = result[1];
			Assert(target.name == "absolute");
			Assert(target.description == "get the absolute value of a number");
			Assert(target.blockType == "o");
			Assert(target.inputDataTypes.length == 1 && target.inputDataTypes[0] == "n");
			Assert(target.internalNodesData[0] == "c,i-0,0,<,1,2");
			Assert(target.internalNodesData[1] == "o,output,i-0,c-n--1,*,terminal");
			Assert(target.internalNodesData[2] == "o,output,i-0,c-n-0,+,terminal");
		});
	});
});