const Component = require("./component");
const Restriction = require("./restriction");

var restriction = Object.create(Restriction.RESTRICTION_SMALL_NUMBER);
var operand = new Component.operand("number", 101);

console.log(operand.validate(restriction));
