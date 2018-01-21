const PlannerComponents = require("./planner-components");
const Component = require("../component");

function generateExercise(plan) {
	function getVariableFromName(name, symbolMappings) {
		for (var i = 0; i < symbolMappings.length; i++) {
			if (symbolMappings[i].name == name) {
				return symbolMappings[i].obj;
			}
		}
		return null;
	}
	function convertSymbolToOperand(str, realParameters, actionParameters, symbolMappings) {
		var content = str.substring(1, str.length - 1);
		if (str.charAt(0) == "(") {
			content = content.split("/");
			var type = content[0];
			var val = content[1];
			if (type == "number") {
				val = parseFloat(val);
			}
			else if (type == "integer") {
				val = parseInt(val);
			}
			return new Component.operand(type, val);
		}
		else if (str.charAt(0) == "[") {
			var name = null;
			for (var i = 0; i < actionParameters.length; i++) {
				if (actionParameters[i].symbol == content) {
					name = realParameters[i].name;
				}
			}
			if (name != null) return getVariableFromName(name, symbolMappings);
			return getVariableFromName("t_" + content, symbolMappings);
		}
	}
	var symbolMappings = [];
	var inputVariables = [];
	var actionResults = [];
	var logicPlan = plan.logicPlan.plan;
	var head = null;
	var tail = null;
	for (var i = logicPlan.length - 1; i >= 0; i--) {
		var currentStep = logicPlan[i];
		var currentAction = currentStep.action;
		var currentParameters = currentStep.parameters;
		var logicInformation = currentAction.logic.split("\r\n");
		
		for (var j = 0; j < currentParameters.length; j++) {
			if (getVariableFromName(currentParameters[j], symbolMappings) == null) {
				if (currentParameters[j].dataType) {
					var variable = new Component.variable(currentParameters[j].dataType);
					symbolMappings.push({obj: variable, name: currentParameters[j].name});
					if (currentParameters[j].isInput) {
						inputVariables.push(variable);
					}
				}
			}
		}
		var terminalNodes = [];
		var nodeList = [];
		for (var j = 0; j < logicInformation.length; j++) {
			if (logicInformation[j].trim() == "") continue;
			var line = logicInformation[j].split(",");
			var type = line[0];
			if (type == "a") {
				var first = convertSymbolToOperand(line[1], currentParameters, currentAction.parameters, symbolMappings);
				var variableOutput = convertSymbolToOperand(line[2], currentParameters, currentAction.parameters, symbolMappings);
				var successors = [];
				if (!line[3]) {
					terminalNodes.push(j);
				}
				else {
					successors = [parseInt(line[3])];
				}
				var node = new Component.node(Component.NODE_TYPE_ASSIGNMENT);
				node.attachInputOperand(first, 0);
				node.setVariableOutput(variableOutput);
				nodeList.push({node: node, successors: successors});
			}
			else if (type == "o") {
				var first = convertSymbolToOperand(line[1], currentParameters, currentAction.parameters, symbolMappings);
				var second = convertSymbolToOperand(line[2], currentParameters, currentAction.parameters, symbolMappings);
				var variableOutput = convertSymbolToOperand(line[3], currentParameters, currentAction.parameters, symbolMappings);
				var operator = line[4];
				var successors = [];
				if (!line[5]) {
					terminalNodes.push(j);
				}
				else {
					successors = [parseInt(line[6])];
				}
				var node = new Component.node(Component.NODE_TYPE_OPERATION);
				node.attachInputOperand(first, 0);
				node.attachInputOperand(second, 1);
				node.setVariableOutput(variableOutput);
				node.setOperator(operator);
				nodeList.push({node: node, successors: successors});
			}
			else if (type == "c") {
				var first = convertSymbolToOperand(line[1], currentParameters, currentAction.parameters, symbolMappings);
				var second = convertSymbolToOperand(line[2], currentParameters, currentAction.parameters, symbolMappings);
				var operator = line[3];
				var successors = [];
				if (!line[4]) {
					terminalNodes.push(j);
				}
				else {
					successors = [parseInt(line[4]), parseInt(line[5])];
				}
				var node = new Component.node(Component.NODE_TYPE_CONDITION);
				node.attachInputOperand(first, 0);
				node.attachInputOperand(second, 1);
				node.setOperator(operator);
				nodeList.push({node: node, successors: successors});
			}
			else if (type == "r") {
				var first = line[1].substring(1, line[1].length - 1);
				for (var k = 0; k < currentAction.parameters.length; j++) {
					if (currentAction.parameters[k].symbol == first) {
						actionResults.push(currentParameters[k]);
						break;
					}
				}
			}
		}
		for (var j = 0; j < nodeList.length; j++) {
			var successors = nodeList[j].successors;
			for (var k = 0; k < successors.length; k++) {
				nodeList[k].node.attachNode(nodeList[successors[k]].node, k);
			}
		}
		for (var j = 0; j < terminalNodes.length; j++) {
			terminalNodes[j] = nodeList[terminalNodes[j]].node;
		}
		if (head == null) {
			head = nodeList[0].node;
		}
		else {
			for (var j = 0; j < tail.length; j++) {
				tail[j].attachNode(nodeList[0].node, 0);
			}
		}
		tail = terminalNodes;
	}
	var finalActionResult = actionResults[0];
	var returnOperand = null;
	if (finalActionResult.dataType) {
		returnOperand = getVariableFromName(finalActionResult.name, symbolMappings);
	}
	var returnNode = new Component.node(Component.NODE_TYPE_RETURN);
	returnNode.attachInputOperand(returnOperand, 0);
	for (var i = 0; i < tail.length; i++) {
		tail[i].attachNode(returnNode, 0);
	}
	return {head: head, symbols: symbolMappings, inputs: inputVariables}
}

module.exports = {generateExercise};