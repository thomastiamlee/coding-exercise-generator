const PlannerComponents = require("./src/planner/planner-components");

const DomainParser = require("./src/planner/domain-parser");

var domain = DomainParser.parseDomain();

var person = new PlannerComponents.existent("person1");
person.parent = domain.getExistentByName("person");
var food = new PlannerComponents.existent("food1");
food.parent = domain.getExistentByName("food");

var action = domain.getActionByName("eat");
