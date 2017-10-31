const Component = require("./src/component");
const Restriction = require("./src/restriction");
const Reader = require("./src/reader");

var result = new Component.variable("number");
var storage = [];
Reader.loadBlocks("./test/sample/block1.blo", storage);
var block1 = Reader.buildBlockFromInformation("average2", storage);
block1.attachInputOperand(new Component.operand("number", 5), 0);
block1.attachInputOperand(new Component.operand("number", 10), 1);
block1.setVariableOutput(result);
var returnNode = new Component.node(Component.NODE_TYPE_RETURN);
returnNode.attachInputOperand(result, 0);
block1.attachNode(returnNode, 0);
var res = block1.evaluateStructure();
console.log(block1.internalHead);