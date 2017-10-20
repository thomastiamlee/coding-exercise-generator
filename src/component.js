NODE_TYPE_OPERATION = 0;
NODE_TYPE_CONDITION = 1;
NODE_TYPE_RETURN = 2;
NODE_TYPE_BLOCK_OPERATION = 3;
NODE_TYPE_BLOCK_CONDITION = 4;
/* Instantiates a new node object of the given type. Use one of the predefined constants above. */
function node(type) {
	this.type = type; // the node type
	this.inputOperands = []; // the input operands to the node
	this.inputOperandRestrictions = []; // the restrictions to the input operands
	this.successors = []; // the succeeding nodes after the current node
	
	if (type == NODE_TYPE_OPERATION) {
		this.variableOutput = null;
	}
	if (type == NODE_TYPE_OPERATION || type == NODE_TYPE_CONDITION) {
		this.operator = null;
	}
	
	this.setOperator = function(operator) {
		this.operator = operator;
	}
	
	this.evaluateThis = function(testOperands) {
		if (this.type == NODE_TYPE_OPERATION) {
			var op1 = testOperands[0].value;
			var op2 = testOperands[1].value;
			var op1Type = testOperands[0].type;
			var op2Type = testOperands[1].type;
			var resVal = null;
			var resType = null;
			switch(this.operator) {
				case "+": resVal = op1 + op2; break;
				case "-": resVal = op1 - op2; break;
				case "*": resVal = op1 * op2; break;
				case "/": if (op2 == 0) throw new Error(); resVal = op1 / op2; break;
			}
			if (op1Type == "string" || op2Type == "string") {
				resType = "string";
			}
			else if (op1Type == "number" || op2Type == "number") {
				resType = "number";
			}
			else if (op1Type == "integer" || op2Type == "integer") {
				resType = "integer";
			}
			var res = new operand(resType, resVal);
			return res;
		}
	}
}

function operand(type, value) {
	this.type = type;
	if (type == "number") {
		value = parseFloat(value);
	}
	else if (type == "integer") {
		value = parseInt(value);
	}
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

module.exports = {NODE_TYPE_OPERATION, NODE_TYPE_BLOCK_CONDITION, NODE_TYPE_RETURN, NODE_TYPE_BLOCK_OPERATION, NODE_TYPE_BLOCK_CONDITION, node, operand};

