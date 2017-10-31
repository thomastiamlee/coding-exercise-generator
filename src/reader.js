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

/* Loads an exercise defined in a file */
function loadExercise(file) {
  var content = File.readFileSync(file, "utf-8").split("\r\n");
	var current = 1;
	
	var symbolMappings = [];
	var inputVariables = [];
	var nodes = [];
	
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
	
	return {head: nodes[0].node, input: inputVariables};
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
This function that all symbolMappings have been read already. */
function convertOperandStringToObject(operandString, symbolMappings) {
	// Variable case
	if (operandString.charAt(0) == '[') {
		return getOperandFromSymbol(operandString.substring(1, operandString.length - 1), symbolMappings);
	}
	// Constant case
	else if (operandString.charAt(0) == '(') {
		var constantData = operandString.substring(1, operandString.length - 1).split("-");
		var dataType = constantData[0];
		var val = constantData[1];
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
}

module.exports = {loadExercise, loadBlocks};