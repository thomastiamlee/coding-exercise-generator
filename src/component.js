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

function operand(type, value) {
	this.type = type;
	this.value = value;
	
	this.validate = function(restriction) {
		if (restriction.datatype != this.type) return false;
		if (this.type == "number") {
			if (restriction.min_value && this.value < restriction.min_value) return false;
			if (restriction.max_value && this.value > restriction.max_value) return false;
			if (restriction.restricted_values) {
				for (var i = 0; i < restriction.restricted_values.length; i++) {
					if (restriction.restricted_values[i] == this.value) return false;
				}
			}
		}
		return true;
	}
}

module.exports = {node, operand};

