const Component = require("./src/component");
const Restriction = require("./src/restriction");


var operand = new Component.operand("number", 101);

console.log(operand.validate(restriction));
