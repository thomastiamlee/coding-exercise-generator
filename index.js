const Component = require("./src/component");
const Restriction = require("./src/restriction");
const Reader = require("./src/reader");

var result = Reader.loadExercise("./test/sample/sample1.exc");

var var1 = result.input[0];
var var2 = result.input[1];
var res = result.head.evaluateStructure([{variable: var1, value: 2}, {variable: var2, value: 6}]);
console.log(res);