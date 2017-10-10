NODE_TYPE_OPERATION = 0;
NODE_TYPE_CONDITION = 1;
NODE_TYPE_RETURN = 2;
/* Instantiates a new node object of the given type. Use one of the predefined constants above. */
function node(type) {
	this.type = type; // the node type
	this.inputOperands = []; // the input operands to the node
	this.inputOperandRestrictions = []; // the restrictions to the input operands
	this.variableOutput = null; // the variable where the output is stored (null if there is no output)
	this.successors = []; // the succeeding nodes after the current node
	
	if (type == NODE_TYPE_OPERATION) {
		this.operator = null;
	}
}

module.exports = {node};

