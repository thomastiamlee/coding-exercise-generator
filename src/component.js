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
		this.setVariableOutput = function(variable) {
			this.variableOutput = variable;
		}
	}
	if (type == NODE_TYPE_OPERATION || type == NODE_TYPE_CONDITION) {
		this.operator = null;
	}
	if (type == NODE_TYPE_BLOCK_OPERATION || type == NODE_TYPE_BLOCK_CONDITION) {
		this.internalHead = null;
	}
	
	this.setOperator = function(operator) {
		this.operator = operator;
	}
	this.setInternalHead = function(internalHead) {
		this.internalHead = internalHead;
	}
	this.attachNode = function(successor, index) {
		this.successors[index] = successor;
	}
	this.attachInputOperand = function(operand, index) {
		this.inputOperands[index] = operand;
	}
	
	/* This function evaluates this node given a set of operands.
	If the node is an [block] operation node, it returns an operand representing the result of the operation.
	If the node is a [block] condition node, it returns true or false, representing the result of the condition.
	If the node is a return node, it returns the operand to be returned. */
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
				case "/": if (op2 == 0) throw new Error("division by zero"); resVal = op1 / op2; break;
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
		else if (this.type == NODE_TYPE_CONDITION) {
			var op1 = testOperands[0].value;
			var op2 = testOperands[1].value;
			switch(this.operator) {
				case ">": return op1 > op2;
				case "<": return op1 < op2;
				case ">=": return op1 >= op2;
				case "<=": return op1 <= op2;
				case "==": return op1 == op2;
				case "!=": return op1 != op2;
			}
		}
		else if (this.type == NODE_TYPE_RETURN) {
			return testOperands[0];
		}
	}
	
	/* This function determines the return value when the structure is evaluated from this node.
	Memory is an object representing the mapping of known variables to their respective values. */
	this.evaluateStructure = function(memory) {
		if (!memory) {
			memory = [];
		}
		var tempOperands = []
		for (var i = 0; i < this.inputOperands.length; i++) {
			if (this.inputOperands[i] instanceof operand) {
				tempOperands.push(this.inputOperands[i]);
			}
			else if (this.inputOperands[i] instanceof variable) {
				tempOperands.push(getValueFromMemory(memory, this.inputOperands[i]));
			}
		}		
		if (this.type == NODE_TYPE_RETURN) {
			return this.evaluateThis(tempOperands);
		}
		else if (this.type == NODE_TYPE_OPERATION) {
			var output = this.evaluateThis(tempOperands);
			memory.push({variable: this.variableOutput, value: output});
			return this.successors[0].evaluateStructure(memory);
		}
		else if (this.type == NODE_TYPE_CONDITION) {
			var output = this.evaluateThis(tempOperands);
			if (output == true) {
				return this.successors[0].evaluateStructure(memory);
			}
			else {
				return this.successors[1].evaluateStructure(memory);
			}
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

function variable(type) {
	this.type = type;
}

function getValueFromMemory(memory, variable) {
	for (var i = 0; i < memory.length; i++) {
		if (memory[i].variable === variable) {
			return memory[i].value;
		}
	}
	return null;
}

module.exports = {NODE_TYPE_OPERATION, NODE_TYPE_CONDITION, NODE_TYPE_RETURN, NODE_TYPE_BLOCK_OPERATION, NODE_TYPE_BLOCK_CONDITION, node, operand, variable};

