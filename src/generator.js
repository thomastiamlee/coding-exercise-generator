const Basic = require("./basic.js");
const Component = require("./component.js");

function generateRandomOperator(nodeType) {
	if (nodeType == Component.NODE_TYPE_OPERATION) {
		var symbols = ["+", "-", "*", "/", "%"];
		return symbols[Math.floor(Math.random() * symbols.length)];
	}
	else if (nodeType == Component.NODE_TYPE_CONDITION) {
		var symbols = ["<", ">", "<=", ">=", "==", "!="];
		return symbols[Math.floor(Math.random() * symbols.length)];
	}
	return null;
}

/* Generate an exercise using basic operations only.
   For options, you may use the following
	 complexity (defaults to 1): an integer value representing the number of basic operations in the generated problem */
function generateBasicExercise(options) {
	// If no options are provided, assume it is empty
	if (!options) {
		options = {};
	}
	// Put default values for non-existent options
	var complexity = 1;
	if (options.complexity) {
		complexity = parseInt(options.complexity);
	}
	function generateStructure(complexity) {
		// Generate nodes until the desired complexity is achieved
		var head = null;
		var nodes = [];
		while (complexity > 0) {
			var random = Math.random();
			if (random >= 0.5) {
				var node = new Component.node(Component.NODE_TYPE_OPERATION);
			}
			else {
				var node = new Component.node(Component.NODE_TYPE_CONDITION);
			}
			var depth = -1;
			if (head == null) {
				head = node;
				depth = 0;
			}
			else {
				var candidates = [];
				for (var i = 0; i < nodes.length; i++) {
					var freeIndices = nodes[i].node.getFreeSuccessorIndices();
					if (freeIndices.length != 0) {
						candidates.push(nodes[i]);
					}
				}
				var selected = candidates[Math.floor(Math.random() * candidates.length)];
				var freeSucccessors = selected.node.getFreeSuccessorIndices();
				var selectedIndex = freeSucccessors[Math.floor(Math.random() * freeSucccessors.length)];
				selected.node.attachNode(node, selectedIndex);
				depth = selected.depth + 1;
			}
			nodes.push({node: node, depth: depth});
			complexity--;
		}
		// Attach return nodes to all free successor slots
		for (var i = 0; i < nodes.length; i++) {
			var freeSucccessors = nodes[i].node.getFreeSuccessorIndices();
			for (var j = 0; j < freeSucccessors.length; j++) {
				var node = new Component.node(Component.NODE_TYPE_RETURN);
				nodes[i].node.attachNode(node, freeSucccessors[j]);
				var depth = nodes[i].depth + 1;
				nodes.push({node: node, depth: depth});
			}
		}
		return {head: head, nodes: nodes};
	}
	
	function assignParameters(head, nodes) {
		var symbolMappings = [];
		var inputVariables = [];
		// Sort the nodes in decreasing order of depth
		for (var i = 0; i < nodes.length; i++) {
			for (var j = i + 1; j < nodes.length; j++) {
				if (nodes[i].depth < nodes[j].depth) {
					var temp = nodes[i];
					nodes[i] = nodes[j];
					nodes[j] = temp;
				}
			}
		}
		// Initialize critical nodes
		var critical = [];
		for (var i = 0; i < nodes.length; i++) {
			var current = nodes[i].node;
			if (current.type == Component.NODE_TYPE_CONDITION || current.type == Component.NODE_TYPE_BLOCK_CONDITION || current.type == Component.NODE_TYPE_RETURN) {
				critical.push(current);
				nodes.splice(i, 1);
				i--;
			}
		}
		// Loop through each node and make it critical
		var variableCounter = nodes.length;
		while (nodes.length > 0) {
			var current = nodes[0].node;
			var variable = new Component.variable("integer");
			symbolMappings.push({name: "X" + variableCounter, obj: variable});
			variableCounter--;
			current.setVariableOutput(variable);
			var attachedCount = 0;
			while (true) {
				var candidates = [];
				for (var j = 0; j < critical.length; j++) {
					var freeIndices = critical[j].getFreeInputOperandIndices();
					if (freeIndices.length == 0) continue;
					var children = current.getAllChildrenSuccessors();
					if (children.indexOf(critical[j]) == -1) continue;
					candidates.push(critical[j]);
				}
				if (candidates.length == 0 && attachedCount == 0) {
					return null;
				}
				else if (candidates.length == 0) {
					break;
				}
				var selected = candidates[Math.floor(Math.random() * candidates.length)];
				var freeIndices = selected.getFreeInputOperandIndices();
				var targetIndex = freeIndices[Math.floor(Math.random() * freeIndices.length)];
				selected.attachInputOperand(variable, targetIndex);
				attachedCount++;
				if (Math.random() >= 0.5) {
					break;
				}
			}
			critical.push(current);
			nodes.splice(0, 1);
		}
		// Fill all nodes without variables as input operands with input variables
		var allNodes = head.getAllChildrenSuccessors();
		var inputCounter = 1;
		var variable = new Component.variable("integer");
		for (var i = 0; i < allNodes.length; i++) {
			var current = allNodes[i];
			var freeIndices = current.getFreeInputOperandIndices();
			if (freeIndices.length == current.inputOperandsSize) {
				var targetIndex = freeIndices[Math.floor(Math.random() * freeIndices.length)];
				current.attachInputOperand(variable, targetIndex);
				if (inputVariables.indexOf(variable) == -1) {
					symbolMappings.push({name: "I" + inputCounter, obj: variable});
					inputVariables.push(variable);
				}
			}
			if (Math.random() >= 0.75) {
				inputCounter++;
				variable = new Component.variable("integer");
			}
		}
		// Fill all remaining slots with random constant integers
		for (var i = 0; i < allNodes.length; i++) {
			var current = allNodes[i];
			var freeIndices = current.getFreeInputOperandIndices();
			for (var j = 0; j < freeIndices.length; j++) {
				var currentIndex = freeIndices[j];
				var constant = new Component.operand("integer", Math.floor(Math.random() * 20) - 10);
				current.attachInputOperand(constant, currentIndex);
			}
		}
		// Randomize operators
		for (var i = 0; i < allNodes.length; i++) {
			var current = allNodes[i];
			if (current.type == Component.NODE_TYPE_OPERATION || current.type == Component.NODE_TYPE_CONDITION) {
				current.setOperator(generateRandomOperator(current.type));
			}
		}
		
		return {head: head, symbols: symbolMappings, inputVariables: inputVariables};
	}
	
	var structure = generateStructure(complexity);
	var exercise = assignParameters(structure.head, structure.nodes);
	return exercise;
}

module.exports = {generateBasicExercise};