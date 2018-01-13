const fs = require("fs");
const Peg = require("pegjs");
const templateGrammarPath = "./src/grammar/text-template.txt";
const nativeTemplatesPath = "./src/native-templates/native.txt";

function loadTemplates() {
	var res = [];
	var data = fs.readFileSync(nativeTemplatesPath, "utf-8");
	var grammar = fs.readFileSync(templateGrammarPath, "utf-8");
	var parser = Peg.generate(grammar, {trace: false});
	var result = parser.parse(data);
	console.log(result);
}

function convertExerciseToNativeText() {
	
}

module.exports = {loadTemplates, convertExerciseToNativeText};