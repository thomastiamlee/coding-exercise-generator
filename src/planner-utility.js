function isPrimitive(type) {
	return type.charAt(type.length - 1) == '*';
}

module.exports = {isPrimitive};