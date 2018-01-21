const PlannerComponents = require("./src/planner/planner-components");
const DomainParser = require("./src/planner/domain-parser");
const TextGenerator = require("./src/planner/text-generator");
const Planner = require("./src/planner/planner");

var domain = DomainParser.parseDomain();
var plan = Planner.plan(domain);
