function convertPlanToText(plan) {
	function removeUnderscore(str) {
		var previous = "";
		while (previous != str) {
			var previous = str;
			str = str.replace("_", " ");
		}
		return str;
	}
	function replacePlaceholders(str, parameters, actionParameters) {
		for (var j = 0; j < parameters.length; j++) {
			var previous = "";
			while (previous != str) {
				var previous = str;
				str = str.replace("[" + actionParameters[j].symbol + "]", removeUnderscore(parameters[j].parent.name));
			}
		}
		for (var j = 0; j < parameters.length; j++) {
			var previous = "";
			while (previous != str) {
				var previous = str;
				str = str.replace("(" + actionParameters[j].symbol + ")", parameters[j].getAlias());
			}
		}
		for (var j = 0; j < parameters.length; j++) {
			var previous = "";
			while (previous != str) {
				var previous = str;
				str = str.replace("{" + actionParameters[j].symbol + "}", parameters[j].logicalValue);
			}
		}
		return str;
	}
	var actionPlan = plan.actionPlan;
	var logicPlan = plan.logicPlan.plan;
	var res = "";
	for (var i = actionPlan.length - 1; i >= 0; i--) {
		var texts = actionPlan[i].action.texts;
		var parameters = actionPlan[i].parameters;
		var actionParameters = actionPlan[i].action.parameters;
		var chosen = replacePlaceholders(texts[Math.floor(Math.random() * texts.length)], parameters, actionParameters);
		
		res += chosen + " ";
	}
	var temp = replacePlaceholders(logicPlan[0].action.mainText + " " + logicPlan[0].action.subText, logicPlan[0].parameters, logicPlan[0].action.parameters);
	for (var i = 1; i < logicPlan.length; i++) {
		var sub = replacePlaceholders(logicPlan[i].action.subText, logicPlan[i].parameters, logicPlan[i].action.parameters);
		temp +=  " " + sub;
	}
	
	res += temp;
	
	return res;
}

module.exports = {convertPlanToText};