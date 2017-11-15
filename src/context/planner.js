const KBLoader = require("./kbloader");

const SELECT_OPTION_UNIFORM_RANDOM = 0;

/* Generates a plan for an exercise from the knowledge base. */
function startPlan() {
	// Get the knowledge base
	var kb = KBLoader.loadKnowledgeBase();
	
	// Select a goal
	log("Selecting goal...");
	var goal = select(kb.goals, SELECT_OPTION_UNIFORM_RANDOM);
	log("Goal selected:");
	log(goal);
	
	// Extracting subgoals
	log("Extracting subgoals...");
	for (var i = goal.subgoals.length - 1; i >= 0; i--) {
		log("Searching for goal: " + goal.subgoals[i]);
	}
}

/* Utility function for selecting an option from an array.
Currently available options:
0 - uniformly random */
function select(arr, option) {
	if (option == 0) {
		return arr[Math.floor(Math.random() * arr.length)];
	}
}

/* Utility function for debugging */
function log(message) {
	console.log(message);
}

module.exports = {startPlan};