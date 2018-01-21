const PlannerComponents = require("./src/planner/planner-components");
const DomainParser = require("./src/planner/domain-parser");
const TextGenerator = require("./src/planner/text-generator");
const Planner = require("./src/planner/planner");

var domain = DomainParser.parseDomain();
console.log(domain);
var plan = Planner.plan(domain);
var text = TextGenerator.convertPlanToText(plan);
console.log(text);