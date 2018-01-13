NODE_TYPE_OPERATION = 0;
NODE_TYPE_ASSIGNMENT = 1;
NODE_TYPE_CONDITION = 2;
NODE_TYPE_RETURN = 3;
NODE_TYPE_BLOCK_OPERATION = 4;
NODE_TYPE_BLOCK_CONDITION = 5;
/* Instantiates a new node object of the given type. Use one of the predefined constants above. */
function node(type) {
	this.type = type; // the node type
	this.inputOperands = []; // the input operands to the node
	this.inputOperandRestrictions = []; // the restrictions to the input operands
	this.successors = []; // the succeeding nodes after the current node
	this.solutionSuccessors = []; // the succeeding nodes after the current node, used in the solution

	if (type == NODE_TYPE_OPERATION || type == NODE_TYPE_BLOCK_OPERATION || type == NODE_TYPE_ASSIGNMENT) {
		this.variableOutput = null;
		this.setVariableOutput = function(variableOutput) {
			this.variableOutput = variableOutput;
			if (this.type == NODE_TYPE_BLOCK_OPERATION || this.type == NODE_TYPE_BLOCK_CONDITION) {
				this.internalHead.replaceAllPlaceholders(variableOutput, -1);
			}
		}
	}
	if (type == NODE_TYPE_OPERATION || type == NODE_TYPE_CONDITION) {
		this.operator = null;
	}
	if (type == NODE_TYPE_BLOCK_OPERATION || type == NODE_TYPE_BLOCK_CONDITION) {
		this.internalHead = null;
		this.setInternalHead = function(internalHead) {
			this.internalHead = internalHead;
		}
		this.internalTerminalNodes = [];
		this.setInternalTerminalNodes = function(internalTerminalNodes) {
			this.internalTerminalNodes = internalTerminalNodes;
		}
	}

	this.setOperator = function(operator) {
		this.operator = operator;
	}
	this.attachNode = function(successor, index) {
		// If the node being attached is a block, make sure to redirect the flow of the solution to the internal head
		var solutionTarget = successor;
		if (successor.type == NODE_TYPE_BLOCK_OPERATION || successor.type == NODE_TYPE_BLOCK_CONDITION) {
			solutionTarget = successor.internalHead;
		}
		this.successors[index] = successor;
		this.solutionSuccessors[index] = solutionTarget;
		// If this node is a block, make sure to redirect all the internal terminal nodes to the successor node as well
		if (this.type == NODE_TYPE_BLOCK_OPERATION || this.type == NODE_TYPE_BLOCK_CONDITION) {
			for (var i = 0; i < this.internalTerminalNodes.length; i++) {
				this.internalTerminalNodes[i].attachNode(successor, index);
			}
		}
	}
	this.attachInputOperand = function(operand, index) {
		this.inputOperands[index] = operand;
		if (operand instanceof placeholder == false && (this.type == NODE_TYPE_BLOCK_OPERATION || this.type == NODE_TYPE_BLOCK_CONDITION)) {
			this.internalHead.replaceAllPlaceholders(operand, index);
		}
	}
	this.replaceAllPlaceholders = function(operand, index, visited) {
		if (!visited) { // Prevent checked nodes from being checked again
			visited = [];
		}
		if (visited.indexOf(this) == -1) {
			visited.push(this);
			for (var i = 0; i < this.inputOperands.length; i++) {
				var current = this.inputOperands[i];
				if (current instanceof placeholder && current.index == index) {
					this.inputOperands[i] = operand;
					if (this.type == NODE_TYPE_BLOCK_OPERATION || this.type == NODE_TYPE_BLOCK_OPERATION) {
						this.internalHead.replaceAllPlaceholders(operand, i, visited);
					}
				}
			}
			if (this.variableOutput && this.variableOutput instanceof placeholder && this.variableOutput.index == index) {
				this.variableOutput = operand;
			}
			for (var i = 0; i < this.successors.length; i++) {
				this.successors[i].replaceAllPlaceholders(operand, index, visited);
			}
		}
	}

	/* This function evaluates this node given a set of operands.
	If the node is an [block] operation node, it returns an operand representing the result of the operation.
	If the node is a [block] condition node, it returns true or false, representing the result of the condition.
	If the node is a return node, it returns the operand to be returned. */
	this.evaluateThis = function(testOperands) {
		if (this.type == NODE_TYPE_ASSIGNMENT) {
			var op1 = testOperands[0].value;
			var op1Type = testOperands[0].type;
			var res = new operand(op1Type, op1);
			return res;
		}
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
		var tempOperands = [];
		for (var i = 0; i < this.inputOperands.length; i++) {
			if (this.inputOperands[i] instanceof operand) {
				tempOperands.push(this.inputOperands[i]);
			}
			else if (this.inputOperands[i] instanceof variable) {
				tempOperands.push(getValueFromMemory(memory, this.inputOperands[i]));
			}
		}
		if (this.type == NODE_TYPE_BLOCK_OPERATION || this.type == NODE_TYPE_BLOCK_CONDITION) {
			return this.internalHead.evaluateStructure(memory);
		}
		if (this.type == NODE_TYPE_RETURN) {
			return this.evaluateThis(tempOperands);
		}
		else if (this.type == NODE_TYPE_ASSIGNMENT) {
			var output = this.evaluateThis(tempOperands);
			registerToMemory(memory, this.variableOutput, output.value);
			return this.solutionSuccessors[0].evaluateStructure(memory);
		}
		else if (this.type == NODE_TYPE_OPERATION) {
			var output = this.evaluateThis(tempOperands);
			registerToMemory(memory, this.variableOutput, output.value);
			return this.solutionSuccessors[0].evaluateStructure(memory);
		}
		else if (this.type == NODE_TYPE_CONDITION) {
			var output = this.evaluateThis(tempOperands);
			if (output == true) {
				return this.solutionSuccessors[0].evaluateStructure(memory);
			}
			else {
				return this.solutionSuccessors[1].evaluateStructure(memory);
			}
		}
	}

	/* Gets all the children from this node, including this node, following the solution path, following in-order traversal. */
	this.getAllSolutionSuccessors = function(added) {
		if (!added) {
			added = [];
		}
		var target = this;
		while (target.type == NODE_TYPE_BLOCK_OPERATION || target.type == NODE_TYPE_BLOCK_CONDITION) {
			target = target.internalHead;
		}
		added.push(target);
		var res = [target];
		if (target.type == NODE_TYPE_OPERATION || target.type == NODE_TYPE_ASSIGNMENT) {
			var first = target.solutionSuccessors[0];
			if (first != null && added.indexOf(first) == -1) res = res.concat(first.getAllSolutionSuccessors(added));
		}
		else if (target.type == NODE_TYPE_CONDITION) {
			var first = target.solutionSuccessors[0];
			if (first != null && added.indexOf(first) == -1) res = res.concat(first.getAllSolutionSuccessors(added));
			var second = target.solutionSuccessors[1];
			if (second != null && added.indexOf(second) == -1) res = res.concat(second.getAllSolutionSuccessors(added));
		}
		return res;
	}
	
	this.getSuccessorCount = function() {
		if (this.type == NODE_TYPE_OPERATION || this.type == NODE_TYPE_BLOCK_OPERATION) {
			var total = 0;
			if (this.successors[0] != null)	total++;
			return total;
		}
		else if (this.type == NODE_TYPE_CONDITION || this.type == NODE_TYPE_BLOCK_CONDITION) {
			var total = 0;
			if (this.successors[0] != null)	total++;
			if (this.successors[1] != null)	total++;
			return total;
		}
		return 0;
	}
	
	this.getMaximumSuccessors = function() {
		if (this.type == NODE_TYPE_OPERATION || this.type == NODE_TYPE_BLOCK_OPERATION) {
			return 1;
		}
		else if (this.type == NODE_TYPE_CONDITION || this.type == NODE_TYPE_BLOCK_CONDITION) {
			return 2;
		}
		return 0;
	}
	
	this.getFreeSuccessorIndices = function() {
		if (this.type == NODE_TYPE_OPERATION || this.type == NODE_TYPE_BLOCK_OPERATION) {
			var res = [];
			if (this.successors[0] == null) res.push(0);
			return res;
		}
		else if (this.type == NODE_TYPE_CONDITION || this.type == NODE_TYPE_BLOCK_CONDITION) {
			var res = [];
			if (this.successors[0] == null) res.push(0);
			if (this.successors[1] == null) res.push(1);
			return res;
		}
		return [];
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

/* This operand is only to be used only in internal nodes as placeholders for the input variables and output.
If the index is >= 0, it is treated as a placeholder for an input variable to the block.
If the index is -1, it is treated as a placeholder for the output of the block (operation node only). */
function placeholder(index) {
	this.index = index;
}

/* Returns an operand object representing the value of a given variable */
function getValueFromMemory(memory, variable) {
	for (var i = 0; i < memory.length; i++) {
		if (memory[i].variable === variable) {
			return new operand(variable.type, memory[i].value);
		}
	}
	return null;
}

function registerToMemory(memory, variable, value) {
	var index = -1;
	for (var i = 0; i < memory.length; i++) {
		if (memory[i].variable === variable) {
			index = i;
		}
	}
	if (index == -1) {
		memory.push({variable: variable, value: value});
	}
	else {
		memory[index].value = value;
	}
}

module.exports = {NODE_TYPE_OPERATION, NODE_TYPE_CONDITION, NODE_TYPE_RETURN, NODE_TYPE_BLOCK_OPERATION, NODE_TYPE_BLOCK_CONDITION, NODE_TYPE_ASSIGNMENT, node, operand, variable, placeholder};
