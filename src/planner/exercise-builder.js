const PlannerComponents = require("./planner-components");
const Component = require("../component");

function generateExercise(plan) {
	function getVariableFromName(name, symbolMappings) {
		for (var i = 0; i < symbolMappings.length; i++) {
			if (symbolMappings[i].name == name) {
				return symbolMappings[i].variable;
			}
		}
		return null;
	}
	function convertSymbolToOperand(str, realParameters, actionParameters, symbolMappings) {
		var content = str.substring(1, str.length - 1);
		if (str.charAt(0) == "(") {
			
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
					symbolMappings.push({variable: variable, name: currentParameters[j].name});
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
	return {head: head, symbolMappings: symbolMappings, inputVariables: inputVariables}
}

module.exports = {generateExercise};