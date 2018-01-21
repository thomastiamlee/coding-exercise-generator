const fs = require("fs");
const Peg = require("pegjs");
const Component = require("../component");
const templateGrammarPath = "./src/naive/grammar/template-grammar.txt";
const nativeTemplatesPath = "./src/naive/templates/native.txt";

function loadNativeTemplates() {
	var data = fs.readFileSync(nativeTemplatesPath, "utf-8");
	var grammar = fs.readFileSync(templateGrammarPath, "utf-8");
	var parser = Peg.generate(grammar, {trace: false});
	var result = parser.parse(data);
	return result;
}

function convertExerciseToNativeText(node, symbolMappings, templates) {
	if (!templates) {
		templates = loadNativeTemplates();
	}
	var res = "";
	if (node.type == Component.NODE_TYPE_OPERATION) {
		var text = getRandomTemplateText(templates, getOperatorString(node.operator));
		text = text.replace("[0]", getSymbolFromOperand(node.inputOperands[0], symbolMappings));
		text = text.replace("[1]", getSymbolFromOperand(node.inputOperands[1], symbolMappings));
		text = text.replace("[o]", getSymbolFromOperand(node.variableOutput, symbolMappings));
		text = text.replace("(0)", convertExerciseToNativeText(node.successors[0], symbolMappings, templates));
	}
	else if (node.type == Component.NODE_TYPE_CONDITION) {
		var text = getRandomTemplateText(templates, getOperatorString(node.operator));
		text = text.replace("[0]", getSymbolFromOperand(node.inputOperands[0], symbolMappings));
		text = text.replace("[1]", getSymbolFromOperand(node.inputOperands[1], symbolMappings));
		text = text.replace("(0)", convertExerciseToNativeText(node.successors[0], symbolMappings, templates));
		text = text.replace("(1)", convertExerciseToNativeText(node.successors[1], symbolMappings, templates));
	}
	else if (node.type == Component.NODE_TYPE_RETURN) {
		var text = getRandomTemplateText(templates, "return");
		text = text.replace("[0]", getSymbolFromOperand(node.inputOperands[0], symbolMappings));
	}
	return text;
}

function getRandomTemplateText(templates, key) {
	for (var i = 0; i < templates.length; i++) {
		if (templates[i].heading == key) {
			var candidates = templates[i].templates;
			return candidates[Math.floor(Math.random() * candidates.length)];
		}
	}
	return null;
}

function getOperatorString(operator) {
	switch(operator) {
		case "+": return "addition";
		case "-": return "subtraction";
		case "*": return "multiplication";
		case "/": return "division";
		case "%": return "modulo";
		case ">": return "greater";
		case "<": return "less";
		case ">=": return "greaterequal";
		case "<=": return "lessequal";
		case "==": return "equal";
		case "!=": return "notequal";
	}
}

/* Utility function for searching the symbol mappings to get the variable name of a given operand.
This function returns null is the symbol was not found. */
function getSymbolFromOperand(operand, symbolMappings) {
	if (operand instanceof Component.operand) {
		return operand.value;
	}
	for (var i = 0; i < symbolMappings.length; i++) {
		if (symbolMappings[i].obj == operand) {
			return symbolMappings[i].name;
		}
	}
	return null;
}

module.exports = {convertExerciseToNativeText};