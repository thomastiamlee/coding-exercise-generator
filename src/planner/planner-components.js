var localMemory = function(domain) {
	this.domain = domain;
	this.localExistents = [];
	this.localAssertions = [];
	this.namingCounter = 1;
	
	var localExistent = function(type) {
		this.name = type + namingCounter;
		this.parent = domain.getExistentByName(type);
		this.namingCounter++;
	}	
	this.createLocalExistent(types) {
		if (types instanceof Array == false) {
			types = [types];
		}
		for (var i = 0; i < types.length; i++) {
			this.localExistents.push(new localExistent(types[i]));
		}
	}
}
