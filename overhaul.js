const PlannerComponents = require("./src/planner/planner-components");
const DomainParser = require("./src/planner/domain-parser");
const Planner = require("./src/planner/planner");

var domain = DomainParser.parseDomain();

var person = new PlannerComponents.existent("person1");
person.parent = domain.getExistentByName("person");
var food = new PlannerComponents.existent("food1");
food.parent = domain.getExistentByName("food");
var food2 = new PlannerComponents.existent("food2");
food2.parent = domain.getExistentByName("food");

var action = domain.getActionByName("eat");
var match = action.getParameterMatchings([person, food]);

var initial = new PlannerComponents.state([ new PlannerComponents.query(true, "hungry", [person]), new PlannerComponents.query(true, "edible", [food])]);
var goal = new PlannerComponents.state([ new PlannerComponents.query(false, "hungry", [person])]);

var x = goal.regress(action, match[0]);

Planner.backwardStateSpaceSearch([person, food], initial, goal, domain);