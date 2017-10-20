RESTRICTION_SMALL_NUMBER = {
	datatype: "number",
	min_value: -100,
	max_value: 100
};

RESTRICTION_SMALL_NUMBER_POSITIVE = {
	datatype: "number",
	min_value: 1,
	max_value: 100
}

RESTRICTION_SMALL_NUMBER_NONZERO = {
	datatype: "number",
	min_value: -100,
	max_value: 100,
	restricted_values: [0]
}

module.exports = {RESTRICTION_SMALL_NUMBER, RESTRICTION_SMALL_NUMBER_POSITIVE, RESTRICTION_SMALL_NUMBER_NONZERO};