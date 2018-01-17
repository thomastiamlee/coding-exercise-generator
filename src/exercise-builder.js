const Component = require("./component");

function buildExerciseFromActions(plan, table) {
	var res = [];
	var inputVariables = [];
	var head = null;
	var currentTail = null; // The node where the next action will be connected to
	var symbolMappings = [];	
	// Add the local entities as variables
	var localEntities = table.getLocalEntity();
	for (var i = 0; i < localEntities.length; i++) {
		symbolMappings.push({name: "e_" + localEntities[i].name, obj: new Component.variable("number")});
	}
	// Add all the initialization variables
	var allAliases = [];
	var count = [];
	var counter = "A".charCodeAt(0);
	for (var i = 0; i < plan.length; i++) {
		var current = plan[i].action.initialize;
		for (var j = 0; j < current.length; j++) {
			var alias = current[j].alias;
			current[j].alias = String.fromCharCode(counter);
			counter++;
			var newVariable = new Component.variable(current[j].type);
			inputVariables.push(newVariable);
			symbolMappings.push({name: current[j].alias, obj: newVariable});
		}
	}
	// Loop through all the actions
	for (var i = 0; i < plan.length; i++) {
		var actionOutput = null;
		var currentStep = plan[i];
		currentStep.number = i;
		var currentAction = currentStep.action;
		if (currentAction.blockData == null) continue;
		var terminalNodes = [];
		var blockData = currentAction.blockData.split("\r\n");
		// Get the number of variables
		var numVariables = parseInt(blockData[0]);
		// Read the variables
		for (var j = 0; j < numVariables; j++) {
			var variableData = blockData[1 + j].split("-");
			var name = "t_" + variableData[0];
			var type = variableData[1];
			var obj = getOperandFromSymbol(name, symbolMappings);
			if (obj != null) {
				symbolMappings.splice(symbolMappings.indexOf(obj), 1);
			}
			symbolMappings.push({name: name, obj: new Component.variable(type)});
		}
		// Get the terminal nodes
		var terminalNodeData = blockData[numVariables + 1];
		for (var j = 0; j < terminalNodeData.length; j++) {
			terminalNodes.push(parseInt(terminalNodeData[j]));
		}
		// Read the nodes
		var current = numVariables + 2;
		var nodeList = [];
		while (current < blockData.length) {
			var currentBlock = blockData[current].split(",");
			var type = currentBlock[0];
			if (type == "a") {
				var operand1 = convertOperandStringToObject(currentBlock[1], currentStep, symbolMappings);
				var variableOutput = convertOperandStringToObject(currentBlock[2], currentStep, symbolMappings);
				var successor = [];
				if (currentBlock[3]) {
					successor = [parseInt(currentBlock[3])];
				}
				var newNode = new Component.node(Component.NODE_TYPE_ASSIGNMENT);
				newNode.attachInputOperand(operand1, 0);
				newNode.setVariableOutput(variableOutput);
				newObj = {node: newNode, successor: successor};
				nodeList.push(newObj);
			}
			else if (type == "o") {
				var operand1 = convertOperandStringToObject(currentBlock[1], currentStep, symbolMappings);
				var operand2 = convertOperandStringToObject(currentBlock[2], currentStep, symbolMappings);
				var variableOutput = convertOperandStringToObject(currentBlock[3], currentStep, symbolMappings);
				var operator = currentBlock[4];
				var successor = [];
				if (currentBlock[5]) {
					successor = [parseInt(currentBlock[5])];
				}
				var newNode = new Component.node(Component.NODE_TYPE_OPERATION);
				newNode.attachInputOperand(operand1, 0);
				newNode.attachInputOperand(operand2, 1);
				newNode.setVariableOutput(variableOutput);
				newNode.setOperator(operator);
				newObj = {node: newNode, successor: successor};
				nodeList.push(newObj);
			}
			else if (type == "c") {
				var operand1 = convertOperandStringToObject(currentBlock[1], currentStep, symbolMappings);
				var operand2 = convertOperandStringToObject(currentBlock[2], currentStep, symbolMappings);
				var operator = currentBlock[3];
				var successor = [];
				if (currentBlock[4]) {
					successor = [parseInt(currentBlock[4]), parseInt(currentBlock[5])];
				}
				var newNode = new Component.node(Component.NODE_TYPE_CONDITION);
				newNode.attachInputOperand(operand1, 0);
				newNode.attachInputOperand(operand2, 1);
				newNode.setOperator(operator);
				newObj = {node: newNode, successor: successor};
				nodeList.push(newObj);
			}
			else if (type == "z") {
				var operand = convertReferenceToEntity(currentBlock[1], currentStep);
				actionOutput = operand;	
			}
			current++;
		}
		// Connect the nodes
		for (var j = 0; j < nodeList.length; j++) {
			var current = nodeList[j];
			if (current.successor.length > 0) {
				for (var k = 0; k < current.successor.length; k++) {
					current.node.attachNode(nodeList[current.successor[k]].node, k);
				}
			}
		}
		// Add to the main exercise
		var actionHead = nodeList[0].node;
		if (currentTail == null) {
			head = actionHead;
		}
		else {
			currentTail.attachNode(actionHead, 0);
		}
		plan[i].actionOutput = actionOutput;
		currentTail = nodeList[terminalNodes[0]].node;
	}
	// Add a return node
	var returnNode = new Component.node(NODE_TYPE_RETURN);
	var lastActionResult = getOperandFromSymbol("e_" + plan[plan.length - 1].actionOutput.name, symbolMappings);
	returnNode.attachInputOperand(lastActionResult, 0);
	if (currentTail != null) {
		currentTail.attachNode(returnNode, 0);
	}
	else {
		head = returnNode;
	}
	currentTail = returnNode;
	
	var res = {};
	res.head = head;
	res.symbols = symbolMappings;
	res.inputVariables = inputVariables;
	res.returnType = lastActionResult.type;
	return res;
}

/* Utility function for searching the symbol mappings to get the actual variable object of a given key.
This function returns null if the symbol was not found. */
function getOperandFromSymbol(name, symbolMappings) {
	for (var i = 0; i < symbolMappings.length; i++) {
		if (symbolMappings[i].name == name) {
			return symbolMappings[i].obj;
		}
	}
	return null;
}

function convertReferenceToEntity(referenceString, step) {
	var parameters = step.parameters;
	var create = step.createParameters;
	
	if (referenceString.charAt(0) == '{') {
		var data = referenceString.substring(1, referenceString.length - 1);
		if (data.charAt(0) == "+") {
			var index = parseInt(data.substring(1));
			return create[index];
		}
		else {
			var index = parseInt(data);
			return parameters[index];
		}
	}
}

/* Utility function for converting an operand string to the corresponding object.
[x1] will be converted to the actual x1 variable object.
(number-3) will be converted to a constant number operand with a value of 3.0.
/0<height/ will be converted to the corresponding
variable from the memory table.
This function assumes that all symbolMappings have been read already. */
function convertOperandStringToObject(operandString, step, symbolMappings) {
	var parameters = step.parameters;
	var create = step.createParameters;
	var stepNumber = step.number;
	// Variable case
	if (operandString.charAt(0) == '[') {
		return getOperandFromSymbol("t_" + operandString.substring(1, operandString.length - 1), symbolMappings);
	}
	// Constant case
	else if (operandString.charAt(0) == '(') {
		var constantData = operandString.substring(1, operandString.length - 1);
		var dataType = constantData.substring(0, constantData.indexOf('-'));
		var val = constantData.substring(constantData.indexOf('-') + 1);
		if (dataType == "number") {
			return new Component.operand(dataType, parseFloat(val));
		}
		else if (dataType == "int") {
			return new Component.operand(dataType, parseInt(val));
		}
		else if (dataType == "string") {
			return new Component.operand(dataType, val);
		}
	}
	else if (operandString.charAt(0) == '{') {
		var data = operandString.substring(1, operandString.length - 1);
		if (data.charAt(0) == "+") {
			var index = parseInt(data.substring(1));
			var name = create[index].name;
			return getOperandFromSymbol("e_" + name, symbolMappings);
		}
		else if (data.charAt(0) == "-") {
			var index = parseInt(data.substring(1));
			var alias = step.action.initialize[index].alias;
			return getOperandFromSymbol(alias, symbolMappings);	
		}
		else {
			var index = parseInt(data);
			var name = parameters[index].name;
			return getOperandFromSymbol("e_" + name, symbolMappings);
		}
	}
}

module.exports = {buildExerciseFromActions};