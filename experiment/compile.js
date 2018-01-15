const fs = require("fs");
const exec = require("child_process").exec;

const functionName = "func";
const codePath = "experiment/temp/Main.java";

function generateJavaCode(functionString, testCases) {
	var res = "public class Main {\n";
	res += functionString + "\n";
	res += "public static void main(String[] args) {\n";
	res += "Main o = new Main();\n";
	for (var i = 0; i < testCases.length; i++) {
		var line = "System.out.println(o." + functionName + "(";
		for (var j = 0; j < testCases[i].parameters.length; j++) {
			var data = testCases[i].parameters[j];
			line += data;
			if (j != testCases[i].parameters.length - 1) {
				line += ",";
			}
		}
		line += "));\n";
		res += line;
	}
	res += "};\n";
	res += "};\n";
	return res;
}

function writeCodeToFile(code) {
	fs.writeFileSync(codePath, code);
}

function runSubmission(functionString, testCases, callback) {
	var code = generateJavaCode(functionString, testCases);
	writeCodeToFile(code);
	var result = false;
	exec("javac ./experiment/temp/Main.java", (error, stdout, stderr) => {
		if (error !== null) {
			result = true;
			callback("failed", stderr);
		}
		else {
			exec("java -cp experiment/temp Main", (error, stdout, stderr) => {
				if (error !== null) {
					result = true;
					callback("failed", stderr);
				}
				else {
					result = true;
					var currentOutput = stdout;
					callback("success", stdout);
				}
			});
		}
	});
	
	setTimeout(function() {
		if (result == false) {
			result = true;
			callback("failed", "timeout");
		}
	}, 10000);
}

function checkOutput(output, testCases) {
	var output = output.split("\r\n");
	for (var i = 0; i < testCases.length; i++) {
		var expected = parseFloat(testCases[i].returnValue);
		var actual = parseFloat(output[i]);
		if (Math.abs(expected - actual) > 0.01) {
			return {verdict: "failed", input: testCases[i].parameters, expected: expected, actual: actual};
		}		
	}
	return {verdict: "passed"};
}

function convertTypeToJava(type) {
	if (type == "number") return "float";
	if (type == "integer") return "int";
	if (type == "string") return "String";
}

module.exports = {runSubmission, checkOutput};