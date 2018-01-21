function convertPlanToText(plan) {
	function removeUnderscore(str) {
		var previous = "";
		while (previous != str) {
			var previous = str;
			str = str.replace("_", " ");
		}
		return str;
	}
	var actionPlan = plan.actionPlan;
	var logicPlan = plan.logicPlan;
	var res = "";
	for (var i = actionPlan.length - 1; i >= 0; i--) {
		var texts = actionPlan[i].action.texts;
		var parameters = actionPlan[i].parameters;
		var actionParameters = actionPlan[i].action.parameters;
		var chosen = texts[Math.floor(Math.random() * texts.length)];
		for (var j = 0; j < parameters.length; j++) {
			var previous = "";
			while (previous != chosen) {
				var previous = chosen;
				chosen = chosen.replace("[" + actionParameters[j].symbol + "]", removeUnderscore(parameters[j].parent.name));
			}
		}
		for (var j = 0; j < parameters.length; j++) {
			var previous = "";
			while (previous != chosen) {
				var previous = chosen;
				chosen = chosen.replace("(" + actionParameters[j].symbol + ")", parameters[j].getAlias());
			}
		}
		res += chosen + " ";
	}
	return res;
}

module.exports = {convertPlanToText};