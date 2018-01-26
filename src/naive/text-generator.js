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

function convertExerciseToNativeText(node, symbolMappings, templates, load) {
	if (!templates) {
		templates = loadNativeTemplates();
	}
	if (!load) {
		load = [];
	}
	var finalText = getRandomTemplateText(templates, "function") + " ";
	var labelCounter = "A".charCodeAt(0);
	function convertChunk(node, symbolMappings, templates, load, isImmediate) {
		if (!isImmediate) isImmediate = null;
		var res = "";
		if (node.type == Component.NODE_TYPE_OPERATION) {
			var text = getRandomTemplateText(templates, getOperatorString(node.operator));
			if (node.inputOperands[0] == isImmediate) {
				text = text.replace("[0]", getRandomTemplateText(templates, "result"));
			}
			else {
				text = text.replace("[0]", getSymbolFromOperand(node.inputOperands[0], symbolMappings));
			}	
			if (node.inputOperands[1] == isImmediate) {
				text = text.replace("[1]", getRandomTemplateText(templates, "result"));
			}
			else {
				text = text.replace("[1]", getSymbolFromOperand(node.inputOperands[1], symbolMappings));
			}
									
			if (node.successors[0].isOperandUsedOnlyInThisNode(node.variableOutput)) {
				text = text.split("#")[0] + text.split("#")[2];
				text = text.replace("(0)", convertChunk(node.successors[0], symbolMappings, templates, load, node.variableOutput));
			}
			else {
				text = text.replace(/#/g, "");
				text = text.replace("[o]", getSymbolFromOperand(node.variableOutput, symbolMappings));
				text = text.replace("(0)", convertChunk(node.successors[0], symbolMappings, templates, load));
			}
		}
		else if (node.type == Component.NODE_TYPE_CONDITION) {
			var text = getRandomTemplateText(templates, getOperatorString(node.operator));
			if (node.inputOperands[0] == isImmediate) {
				text = text.replace("[0]", getRandomTemplateText(templates, "result"));
			}
			else {
				text = text.replace("[0]", getSymbolFromOperand(node.inputOperands[0], symbolMappings));
			}	
			if (node.inputOperands[1] == isImmediate) {
				text = text.replace("[1]", getRandomTemplateText(templates, "result"));
			}
			else {
				text = text.replace("[1]", getSymbolFromOperand(node.inputOperands[1], symbolMappings));
			}
			if (node.successors[0].hasConditionNode() == false) {
				text = text.replace("(0)", convertChunk(node.successors[0], symbolMappings, templates, load));
			}
			else {
				load.push({label: String.fromCharCode(load.length + 65), head: node.successors[0]});
				text = text.replace("(0)", getRandomTemplateText(templates, "groupbranch").replace("[0]", String.fromCharCode(labelCounter++)));
			}
			if (node.successors[1].hasConditionNode() == false) {
				text = text.replace("(1)", convertChunk(node.successors[1], symbolMappings, templates, load));
			}
			else {
				load.push({label: String.fromCharCode(load.length + 65), head: node.successors[1]});
				text = text.replace("(1)", getRandomTemplateText(templates, "groupbranch").replace("[0]", String.fromCharCode(labelCounter++)));
			}
		}
		else if (node.type == Component.NODE_TYPE_RETURN) {
			var text = getRandomTemplateText(templates, "return");
			if (node.inputOperands[0] == isImmediate) {
				text = text.replace("[0]", getRandomTemplateText(templates, "result"));
			}
			else {
				text = text.replace("[0]", getSymbolFromOperand(node.inputOperands[0], symbolMappings));
			}	
		}
		return text;
	}
	finalText += convertChunk(node, symbolMappings, templates, load);
	while (load.length > 0) {
		finalText += "[LB]" + load[0].label + ": " + convertChunk(load[0].head, symbolMappings, templates, load);
		load.splice(0, 1);
	}
	return finalText;
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