const Component = require("./component");

function generateTestCases(exercise, count) {
	var inputVariables = exercise.inputVariables;
	var res = [];
	for (var i = 0; i < count; i++) {
		var parameters = [];
		var memory = [];
		for (var j = 0; j < inputVariables.length; j++) {
			var type = inputVariables[j].type;
			var value = generateRandomConstant(type);
			parameters.push(value);
			memory.push({variable: inputVariables[j], value: value});
			
		}
		try {
			var returnValue = exercise.head.evaluateStructure(memory);
			if (!isNaN(returnValue.value))
				res.push({parameters: parameters, returnValue: returnValue.value});
		} catch (err) {
			console.log("Exception encountered in generating test case.");
		}
		
	}
	return res;
}

function generateRandomConstant(type) {
	if (type == "integer") {
		return Math.floor(Math.random() * 41) - 20;
	}
	else if (type == "number") {
		return Math.floor(Math.random() * 210) / 10;
	}
}

module.exports = {generateTestCases};