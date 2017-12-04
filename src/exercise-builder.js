const Component = require("./component");

function buildExerciseFromActions(plan, table) {
	var res = {};
	var lastHead = null;
	var head = null;
	var symbolMappings = [];
	// Add the space entities as variables
	var space = table.space;
	for (var i = 0; i < space.length; i++) {
		if (space[i][0].charAt(space[i][0].length - 1) == '*') {
			symbolMappings.push({name: space[i][0], obj: new Component.variable("number")})
		}
	}
	// Loop through all actions
	for (var i = 0; i < plan.length; i++) {
		var currentAction = plan[i];
		if (currentAction.action.blockData) {
			var parameters = currentAction.parameters;
			var blockData = currentAction.action.blockData.split("\r\n");
			var current = 0;
			current++;
			var line = blockData[current];
			// Read the variables
			while (line.trim() != "%NODES") {
				var variableData = line.split("-");
				var name = variableData[0];
				var dataType = variableData[1];
				if (getOperandFromSymbol(name, symbolMappings) == null) {
					var newObj = {name: name, obj: new Component.variable("number")};
					symbolMappings.push(newObj);
				}
				current++;
				line = blockData[current];
			}
			current++;
			// Read the nodes
			var nodes = [];
			var localHead = null;
			var localTail = null;
			var line = blockData[current];
			while (line != "%RESULTS") {
				var isTerminal = false;
				if (line.charAt(0) == '@') {
					isTerminal = true;
					line = line.substring(1);
				}
				lineData = line.split(",");
				var type = lineData[0];
				var newObj = {};
				if (type == 'o') {
					var operand1 = convertOperandStringToObject(lineData[1], parameters, symbolMappings);
					var operand2 = convertOperandStringToObject(lineData[2], parameters, symbolMappings);
					var variableOutput = convertOperandStringToObject(lineData[3], parameters, symbolMappings);
					var operator = lineData[4];
					var successor = [];
					if (!isTerminal) {
						successor = [lineData[5]];
					}
					var newNode = new Component.node(Component.NODE_TYPE_OPERATION);
					newNode.attachInputOperand(operand1, 0);
					newNode.attachInputOperand(operand2, 1);
					newNode.setVariableOutput(variableOutput);
					newNode.setOperator(operator);
					
					newObj = {node: newNode, successor: successor};
					nodes.push(newObj);
				}
				else if (type == 'c') {
					var operand1 = convertOperandStringToObject(lineData[1], parameters, symbolMappings);
					var operand2 = convertOperandStringToObject(lineData[2], parameters, symbolMappings);
					var operator = lineData[3];
					var successor = [];
					if (!isTerminal) {
						successor = [lineData[4], lineData[5]];
					}
					var newNode = new Component.node(Component.NODE_TYPE_CONDITION);
					newNode.attachInputOperand(operand1, 0);
					newNode.attachInputOperand(operand2, 1);
					newNode.setOperator(operator);
					
					newObj = {node: newNode, successor: successor};
					nodes.push(newObj);
					
				}				
				if (localHead == null) {
					localHead = newObj.node;
				}
				if (isTerminal) {
					localTail = newObj.node;
				}
				current++;
				line = blockData[current];
			}
						
			// Connect the nodes
			for (var j = 0; j < nodes.length; j++) {
				var node = nodes[j].node;
				var successors = nodes[j].successor;
				for (var k = 0; k < successors.length; k++) {
					if (successors[k] != null) {
						node.attachNode(nodes[successors[k]].node, k);
					}
				}
			}
			
			// Read the results
			current++;
			while (current < blockData.length) {
				var line = blockData[current];
				var lineData = line.split(",");
				var name = "a" + i + "_" + lineData[0];
				symbolMappings.push({name: name, obj: new Component.variable("number")})
				var variableOutput = convertOperandStringToObject("[" + name + "]", parameters, symbolMappings);
				var operand1 = convertOperandStringToObject(lineData[1], parameters, symbolMappings);
				var operand2 = convertOperandStringToObject("(number-0)", parameters, symbolMappings);
				var newNode = new Component.node(Component.NODE_TYPE_OPERATION);
				newNode.attachInputOperand(operand1, 0);
				newNode.attachInputOperand(operand2, 1);
				newNode.setVariableOutput(variableOutput);
				newNode.setOperator("+");
				newObj = {node: newNode, successor: []};
				nodes.push(newObj);
				localTail.attachNode(newNode, 0);
				localTail = newNode;
				current++;
			}
			
			if (lastHead == null) {
				head = localHead;
				lastHead = localTail;
			}
			else {
				lastHead.attachNode(localHead, 0);
				localTail = lastHead;
			}
		}
	}
	res.head = head;
	res.symbols = symbolMappings;
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

/* Utility function for converting an operand string to the corresponding object.
[x1] will be converted to the actual x1 variable object.
(number-3) will be converted to a constant number operand with a value of 3.0.
/0<height/ will be converted to the corresponding
variable from the memory table.
This function assumes that all symbolMappings have been read already. */
function convertOperandStringToObject(operandString, parameters, symbolMappings) {
	console.log("GETTING: " + operandString);
	console.log(symbolMappings);
	// Variable case
	if (operandString.charAt(0) == '[') {
		return getOperandFromSymbol(operandString.substring(1, operandString.length - 1), symbolMappings);
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
	else if (operandString.charAt(0) == '/') {
		var data = operandString.substring(1, operandString.length - 1);
		if (data.indexOf("<") != -1) {
			var index = parseInt(data.split("<")[0]);
			var name = parameters[index] + "." + data.split("<")[1];
			return getOperandFromSymbol(name, symbolMappings);			
		}
		else {
			return null;
		}
	}
}

module.exports = {buildExerciseFromActions};