const Basic = require("./basic.js");

/* Generate an exercise using basic operations only.
   For options, you may use the following
	 complexity (defaults to 1): an integer value representing the number of basic operations in the generated problem */
function generateBasicExercise(options) {
	// If no options are provided, assume it is empty
	if (!options) {
		options = {};
	}
	// Put default values for non-existent options
	var complexity = 1;
	if (options.complexity) {
		complexity = parseInt(options.complexity);
	}
	
	var node = Basic.getBasicNumberOperation(Basic.getRandomOperationOperator());
}

generateBasicExercise();