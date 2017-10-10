const Component = require("./component.js");
const Restriction = require("./restriction.js");

/* Instantiate a basic operation node with the given parameters.
   operator is either "+", "-", "*", "/", or "%". */
function getBasicNumberOperation(operator) {
	var res = new Component.node(NODE_TYPE_OPERATION);
	res.operator = operator;
	res.inputOperands = [null, null];
	res.inputOperandRestrictions = [Restriction.RESTRICTION_SMALL_NUMBER, Restriction.RESTRICTION_SMALL_NUMBER];
	res.successors = [null];
	return res;
}

module.exports = {getBasicNumberOperation};