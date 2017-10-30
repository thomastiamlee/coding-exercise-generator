const File = require("fs");
const Component = require("./component");

/* Load all blocks from a given directory. The blocks are loaded into the given array. */
function loadBlocks(directory, array) {
	File.readdirSync(directory).forEach(file => {
		var contents = File.readFileSync(directory + "/" + file, "utf-8");
		var contentData = contents.split("\r\n");
		var current = 0;
		while (current < contentData.length) {
			// Extract name
			var name = contentData[current].substring(1);
			current++;
			// Extract description
			var description = contentData[current].substring(1);
			current++;
			// Extract block information
			var blockInformation = contentData[current].split(",");
			var blockType = blockInformation[0];
			var numberOfInputs = parseInt(blockInformation[1]);
			var numberOfNodes = parseInt(blockInformation[2]);
			current++;
			// Extract input data types
			var inputDataTypeInformation = contentData[current].split(",");
			var inputDataTypes = [];
			for (var i = 0; i < numberOfInputs; i++) {
				inputDataTypes[i] = inputDataTypeInformation[i];
			}
			current++;
			// Extract internal nodes data
			var internalNodesData = [];
			for (var i = 0; i < numberOfNodes; i++) {
				internalNodesData.push(contentData[current]);
				current++;
			}
			// Build the object
			var blockObject = {
				name: name,
				description: description,
				blockType: blockType,
				inputDataTypes: inputDataTypes,
				internalNodesData: internalNodesData
			}
			array.push(blockObject);
			current++;
		}
	});
}

module.exports = {loadBlocks};