const File = require("fs");
const Component = require("./component");

/* Loads block information from a file.
The loaded blocks will be stored in the storage array provided). */
function loadBlocks(file, storage) {
	var content = File.readFileSync(file, "utf-8").split("\r\n");
	var current = 0;
	while (current < content.length) {
		// Read the header and description
		var headerInfo = content[current].split(" ");
		var name = headerInfo[0].substring(1);
		var type = headerInfo[1];
		current++;
		var description = content[current];
		current++;
		current++;
		// Read the block input information
		var blockInputInformation = [];
		var line = content[current];
		while (line != "%VARIABLES") {
			blockInputInformation.push(line);
			current++;
			line = content[current];
		}
		current++;
		// Read the variable information
		var variableInformation = [];
		line = content[current];
		while (line != "%NODES") {
			variableInformation.push(line);
			current++;
			line = content[current];
		}
		current++;
		// Read the node information
		var nodeInformation = [];
		line = content[current];
		while (line != "" && current < content.length) {
			nodeInformation.push(line);			
			current++;
			line = content[current];
		}
		current++;
		// Build the object
		var result = {
			name: name,
			type: type,
			description: description,
			blockInputInformation: blockInputInformation,
			variableInformation: variableInformation,
			nodeInformation: nodeInformation
		}
		storage.push(result);
	}
}

/* Builds the block object from the information read from a file.
This method assumes that you have called the loadBlock() method and you are passing the array where the loaded block is stored.
This method returns null if the desired block is not found in the array. */
function buildBlockFromInformation(name, storage) {
	var target = null;
	for (var i = 0; i < storage.length; i++) {
		if (storage[i].name == name) {
			target = storage[i];
		}
	}
	if (target == null) {
		return null;
	}
	// Build the internal structure
	// Read the variables
	var variableInformation = target.variableInformation;
	symbolMappings = [];
	for (var i = 0; i < variableInformation.length; i++) {
		var current = variableInformation[i].split("-");
		var variableName = current[0];
		var dataType = current[1];
		if (getOperandFromSymbol(variableName, symbolMappings) == null) {
			var newObj = {name: variableName, obj: new Component.variable(dataType)};
			symbolMappings.push(newObj);
		}
	}
	// Read the nodes
	var nodeInformation = target.nodeInformation;
	var nodes = [];
	var internalTerminalNodes = [];
	for (var i = 0; i < nodeInformation.length; i++) {
		var current = nodeInformation[i];
		var isTerminal = false;
		if (current.charAt(0) == '@') {
			isTerminal = true;
			current = current.substring(1);
		}
		currentData = current.split(",");
		var type = currentData[0];
		if (type == 'o') {
			var operand1 = convertOperandStringToObject(currentData[1], symbolMappings);
			var operand2 = convertOperandStringToObject(currentData[2], symbolMappings);
			var variableOutput = convertOperandStringToObject(currentData[3], symbolMappings);
			var operator = currentData[4];
			if (isTerminal == false) {
				successor = [currentData[5]];
			}
			else {
				successor = [];
			}
			var newNode = new Component.node(Component.NODE_TYPE_OPERATION);
			newNode.attachInputOperand(operand1, 0);
			newNode.attachInputOperand(operand2, 1);
			newNode.setVariableOutput(variableOutput);
			newNode.setOperator(operator);
			
			var newObj = {node: newNode, successor: successor};
			nodes.push(newObj);
			if (isTerminal) {
				internalTerminalNodes.push(newNode);
			}
		}
		else if (type == 'c') {
			var operand1 = convertOperandStringToObject(currentData[1], symbolMappings);
			var operand2 = convertOperandStringToObject(currentData[2], symbolMappings);
			var operator = currentData[3];
			if (isTerminal == false) {
				successor = [currentData[4], currentData[5]];
			}
			else {
				successor = [];
			}
			var newNode = new Component.node(Component.NODE_TYPE_CONDITION);
			newNode.attachInputOperand(operand1, 0);
			newNode.attachInputOperand(operand2, 1);
			newNode.setOperator(operator);
			
			var newObj = {node: newNode, successor: successor};
			nodes.push(newObj);
			if (isTerminal) {
				internalTerminalNodes.push(newNode);
			}
		}
	}
	// Connect the nodes
	for (var i = 0; i < nodes.length; i++) {
		var currentNode = nodes[i].node;
		var successors = nodes[i].successor;
		for (var j = 0; j < successors.length; j++) {
			if (successors[j] != null) {
				currentNode.attachNode(nodes[successors[j]].node, j);
			}
		}
	}	
	// Build the block
	if (target.type == "o") {
		var res = new Component.node(Component.NODE_TYPE_BLOCK_OPERATION);
		res.setInternalHead(nodes[0].node);
		res.setInternalTerminalNodes(internalTerminalNodes);
		return res;
	}
	else if (target.type == "c") {
		var res = new Component.node(Component.NODE_TYPE_BLOCK_CONDITION);
		res.setInternalHead(nodes[0].node);
		res.setInternalTerminalNodes(internalTerminalNodes);
		res;
	}
}

/* Loads an exercise defined in a file */
function loadExercise(file, blocks) {
  var content = File.readFileSync(file, "utf-8").split("\r\n");
	var current = 1;
	
	var symbolMappings = [];
	var inputVariables = [];
	var nodes = [];
	
	if (!blocks) {
		blocks = [];
	}
	
	// Read the inputs
	var line = content[current];
	while (line != "%VARIABLES") {
		var inputData = line.split("-");
		var name = inputData[0];
		var dataType = inputData[1];
		if (getOperandFromSymbol(name, symbolMappings) == null) {
			var newObj = {name: name, obj: new Component.variable(dataType)}
			symbolMappings.push(newObj);
			inputVariables.push(newObj.obj);
		}
		current++;
		line = content[current];
	}
	current++;
	
	// Read the variables
	line = content[current];
	while (line != "%NODES") {
		var variableData = line.split("-");
		var name = variableData[0];
		var dataType = variableData[1];
		if (getOperandFromSymbol(name, symbolMappings) == null) {
			var newObj = {name: name, obj: new Component.variable(dataType)}
			symbolMappings.push(newObj);
		}
		current++;
		line = content[current];
	}
	
	// Read the nodes
	current++;
	line = content[current];
	while (current < content.length) {
		var nodeData = line.split(",");
		var type = nodeData[0];
		// Operation node
		if (type == "o") {
			var operand1 = convertOperandStringToObject(nodeData[1], symbolMappings);
			var operand2 = convertOperandStringToObject(nodeData[2], symbolMappings);
			var variableOutput = convertOperandStringToObject(nodeData[3], symbolMappings);
			var operator = nodeData[4];
			var successor = nodeData[5];
			
			var newNode = new Component.node(Component.NODE_TYPE_OPERATION);
			newNode.attachInputOperand(operand1, 0);
			newNode.attachInputOperand(operand2, 1);
			newNode.setVariableOutput(variableOutput);
			newNode.setOperator(operator);
			
			var newObj = {node: newNode, successor: [successor]};
			nodes.push(newObj);
		}
		else if (type == "c") {
			var operand1 = convertOperandStringToObject(nodeData[1], symbolMappings);
			var operand2 = convertOperandStringToObject(nodeData[2], symbolMappings);
			var operator = nodeData[3];
			var successor1 = nodeData[4];
			var successor2 = nodeData[5];
			
			var newNode = new Component.node(Component.NODE_TYPE_CONDITION);
			newNode.attachInputOperand(operand1, 0);
			newNode.attachInputOperand(operand2, 1);
			newNode.setOperator(operator);
			
			var newObj = {node: newNode, successor: [successor1, successor2]};
			nodes.push(newObj);
		}
		else if (type == "ob") {
			var blockNname = nodeData[1];
			var block = buildBlockFromInformation(blockName, blocks);
			
		}
		else if (type == "r") {
			var operand1 = convertOperandStringToObject(nodeData[1], symbolMappings);
			
			var newNode = new Component.node(Component.NODE_TYPE_RETURN);
			newNode.attachInputOperand(operand1, 0);
			
			var newObj = {node: newNode, successor: []};
			nodes.push(newObj);
		}
		current++;
		line = content[current];
	}
		
	// Connect the nodes
	for (var i = 0; i < nodes.length; i++) {
		var node = nodes[i].node;
		var successors = nodes[i].successor;
		for (var j = 0; j < successors.length; j++) {
			if (successors[j] != null) {
				node.attachNode(nodes[successors[j]].node, j);
			}
		}
	}
		
	return {head: nodes[0].node, input: inputVariables, symbols: symbolMappings};
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

/* Utility function for searching the symbol mappings to get the variable name of a given operand.
This function returns null is the symbol was not found. */
function getSymbolFromOperand(operand, symbolMappings) {
	for (var i = 0; i < symbolMappings.length; i++) {
		if (symbolMappings[i].obj == operand) {
			return symbolMappings[i].name;
		}
	}
	return null;
}

/* Utility function for converting an operand string to the corresponding object.
[x1] will be converted to the actual x1 variable object.
(number-3) will be converted to a constant number operand with a value of 3.0.
This function assumes that all symbolMappings have been read already. */
function convertOperandStringToObject(operandString, symbolMappings) {
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
		var index = operandString.substring(1, operandString.length - 1);
		if (index == "blockoutput") {
			return new Component.placeholder(-1);
		}
		else {
			return new Component.placeholder(parseInt(index));
		}
	}
}

/* Converts an exercise to a flowchart definition, given its head. */
function convertToFlowchartDefinition(exercise) {
	var head = exercise.head;
	var inputs = exercise.inputs;
	var symbols = exercise.symbols;
	var res = "graph TD\n";
	var nodeInformation = "";
	var nodeConnections = "";
	
	var nodeList = head.getAllSolutionSuccessors();
	for (var i = 0; i < nodeList.length; i++) {
		var currentNode = nodeList[i];
		var letter = "N" + (i + 1);
		var operandStrings = [];
		var operands = currentNode.inputOperands;
		for (var j = 0; j < operands.length; j++) {
			if (operands[j] instanceof Component.operand) {
				operandStrings.push(operands[j].value);
			}
			else if (operands[j] instanceof Component.variable) {
				operandStrings.push(getSymbolFromOperand(operands[j], symbols));
			}
		}
		var successors = currentNode.solutionSuccessors;
		
		var nodeLine = "";
		var connectionLine = "";
		if (currentNode.type == Component.NODE_TYPE_OPERATION) {
			var operator = currentNode.operator;
			var variableOutput = getSymbolFromOperand(currentNode.variableOutput, symbols);
			nodeLine += letter + "[" + variableOutput + " = " + operandStrings[0] + " " + operator + " " + operandStrings[1] + "]\n";
			if (successors[0] != null) {
				connectionLine += letter + " --> N" + (nodeList.indexOf(successors[0]) + 1) + "\n";
			}
		}
		else if (currentNode.type == Component.NODE_TYPE_CONDITION) {
			var operator = currentNode.operator;
			nodeLine += letter + "{" + operandStrings[0] + " " + operator + " " + operandStrings[1] + "}\n";
			if (successors[0] != null) {
				connectionLine += letter + " -->|true| N" + (nodeList.indexOf(successors[0]) + 1) + "\n";
			}
			if (successors[1] != null) {
				connectionLine += letter + " -->|false| N" + (nodeList.indexOf(successors[1]) + 1) + "\n";
			}
		}
		else if (currentNode.type == Component.NODE_TYPE_RETURN) {
			nodeLine += letter + "(return " + operandStrings[0] + ")\n";
		}
		if (nodeLine != "")	nodeInformation += nodeLine;
		if (connectionLine != "") nodeConnections += connectionLine;
	}
		
	res += nodeInformation + nodeConnections;
	return res;
}

module.exports = {loadExercise, loadBlocks, buildBlockFromInformation, convertToFlowchartDefinition, getOperandFromSymbol, getSymbolFromOperand};