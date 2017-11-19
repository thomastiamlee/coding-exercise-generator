const Assert = require("assert");
const Parser = require("../src/parser");

describe("parser", function() {
	describe("#parseKnowledgeBase", function() {
		var result = Parser.parseKnowledgeBase("./test/kbtest.txt");
		it ("Type list should contain 15 elements.", function() {
			Assert(result.type_list && result.type_list.length == 15);
		});
		it("Relationships list should contain 4 elements.", function() {
			Assert(result.relationship_list && result.relationship_list.length == 4);
		});
		it("Actions list should contain 2 elements.", function() {
			Assert(result.action_list && result.action_list.length == 2);
		});
	});
});