const Assert = require("assert");
const Parser = require("../src/parser");

describe("parser", function() {
	describe("#parseKnowledgeBase", function() {
		/*
		var result = Parser.parseKnowledgeBase("./test/kbtest.txt");
		it ("Type list should contain 15 elements.", function() {
			Assert(result.type_list && result.type_list.length == 15);
		});
		it("The ninth element should be [\"person\", []].", function() {
			Assert(result.type_list[8][0] == "person" && result.type_list[8][1].length == 0);
		});
		it("The twelfth element should be [\"restaurant\", [\"location\"]].", function() {
			Assert(result.type_list[11][0] == "restaurant" && result.type_list[11][1][0] == "location");
		});
		it("The tenth element should be [\"personname*\", [\"stringvalue*\"]].", function() {
			Assert(result.type_list[9][0] == "personname*" && result.type_list[9][1][0] == "stringvalue*");
		});
		it("Relationships list should contain 4 elements.", function() {
			Assert(result.relationship_list && result.relationship_list.length == 4);
		});
		it ("The first relationship should be has(person name).", function() {
			Assert(result.relationship_list[0].predicate == "has" && result.relationship_list[0].parameters.length == 2 &&
			result.relationship_list[0].parameters[0] == "person" && result.relationship_list[0].parameters[1] == "name");
		});
		it ("The fourth relationship should be foundin(ramen restaurant).", function() {
			Assert(result.relationship_list[3].predicate == "foundin" && result.relationship_list[3].parameters.length == 2 &&
			result.relationship_list[3].parameters[0] == "ramen" && result.relationship_list[3].parameters[1] == "restaurant");
		});
		it("Actions list should contain 2 elements.", function() {
			Assert(result.action_list && result.action_list.length == 2);
		});
		it("The first action should be the eat action.", function() {
			Assert(result.action_list[0].name == "eat");
			Assert(result.action_list[0].parameters.length == 2);
			Assert(result.action_list[0].parameters[0] == "person");
			Assert(result.action_list[0].parameters[1] == "food");
			Assert(result.action_list[0].preconditions.length == 0);
			Assert(result.action_list[0].effects.length == 0);
		});
		it("The second action should be the mention action.", function() {
			Assert(result.action_list[1].name == "mention");
			Assert(result.action_list[1].parameters.length == 2);
			Assert(result.action_list[1].parameters[0] == "*");
			Assert(result.action_list[1].parameters[1] == "*");
			Assert(result.action_list[1].preconditions.length == 2);
			Assert(result.action_list[1].preconditions[0].truth == true);
			Assert(result.action_list[1].preconditions[0].predicate == "has");
			Assert(result.action_list[1].preconditions[0].parameters.length == 2);
			Assert(result.action_list[1].preconditions[0].parameters[0] == "0");
			Assert(result.action_list[1].preconditions[0].parameters[1] == "1");
			Assert(result.action_list[1].preconditions[1].truth == false);
			Assert(result.action_list[1].preconditions[1].predicate == "visible");
			Assert(result.action_list[1].preconditions[1].parameters.length == 2);
			Assert(result.action_list[1].preconditions[1].parameters[0] == "0");
			Assert(result.action_list[1].preconditions[1].parameters[1] == "1");
			Assert(result.action_list[1].effects.length == 1);			
			Assert(result.action_list[1].effects[0].truth == true);
			Assert(result.action_list[1].effects[0].predicate == "visible");	
			Assert(result.action_list[1].effects[0].parameters.length == 2);	
			Assert(result.action_list[1].effects[0].parameters[0] == "0");
			Assert(result.action_list[1].effects[0].parameters[1] == "1");
		});
		*/
	});
});