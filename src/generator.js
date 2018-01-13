const Basic = require("./basic.js");
const Component = require("./component.js");

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
		for (var i = 0; i < nodes.length; i++) {
			var current = nodes[i].node;
			var candidates = [];
			for (var j = 0; j < critical.length; j++) {
				
			}
		}
	}
	
	var structure = generateStructure(complexity);
	return {head: structure.head, symbols: [], inputVariables: []};
}

module.exports = {generateBasicExercise};