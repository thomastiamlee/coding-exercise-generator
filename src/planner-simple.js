const Parser = require("./parser");
const PlannerUtility = require("./planner-utility");

/* Attempts to plan an exercise, given the initial space.
The space is an array containing non-primitive type names
that will serve as possible elements in the story. */
function planExercise(space) {
	var kb = Parser.parseKnowledgeBase("./src/kb/simple-space.txt");
	// Create an object for each space element
	var table = PlannerUtility.initializeMemoryTable(space, kb);
	
	// Search for available actions
	while (true) {
		var actions = PlannerUtility.getAvailableActions(table, kb);
		if (actions.length == 0) {
			break;
		}
		// Choose a random action
		var randomIndex = Math.floor(Math.random() * actions.length);
		var chosenAction = actions[randomIndex];
		console.log("Chosen action: ");
		console.log(chosenAction);
		
		PlannerUtility.executeAction(chosenAction.action, chosenAction.parameters, kb);
	}
}


module.exports = {planExercise};