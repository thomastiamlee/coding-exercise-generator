ui = {};
system = {};

function init(editor) {
	ui.doc = {}; ui.overlay = {}; ui.text = {};
	ui.editor = editor;
	ui.doc.taskHeading = $("#task-heading");
	ui.doc.exerciseText = $("#exercise-text");
	ui.doc.functionHeader = $("#function-header");
	ui.doc.testPanelInputList = $("#test-panel-input-list");
	ui.doc.testSpinner = $("#test-spinner");
	ui.doc.testResultLabel = $("#test-result-label");
	ui.doc.testResultText = $("#test-result-text");
	ui.doc.testButton = $("#test-button");
	ui.doc.testButtonText = $("#test-button span");
	ui.doc.submitButton = $("#submit-button");
	ui.overlay.overlay = $("#overlay");
	ui.overlay.fakeOverlay = $("#fake-overlay");
	ui.overlay.loadingPanel = $("#loading-panel");
	ui.overlay.notificationPanel = $("#notification-panel");
	ui.overlay.loadingText = $("#loading-text");
	ui.overlay.notificationIconCorrect = $("#notification-icon-correct");
	ui.overlay.notificationIconWrong = $("#notification-icon-wrong");
	ui.overlay.notificationText = $("#notification-text");
	ui.overlay.notificationButton = $("#notification-button");
		
	ui.doc.taskHeading.text("Exercise");
	ui.doc.exerciseText.text("Loading...");
	ui.doc.functionHeader.text("int func() {");
	ui.doc.testPanelInputList.html("");
	ui.doc.testSpinner.css("visibility", "hidden");
	ui.doc.testResultText.text("");
	ui.doc.testButton.on("click", function() {
		testCode();
	});
	ui.doc.submitButton.on("click", function() {
		submitCode();
	});
	
	/* ENGLISH VERSION
	ui.text.generationText = "Now thinking of an exercise for you...";
	ui.text.checkingText = "Now checking your solution...";
	ui.text.correctText = "Your code passed the test cases! Nice job.";
	ui.text.wrongText = "Your code failed some test cases. Try again.";
	ui.text.task = "Exercise";
	ui.text.testButton = "Test";
	ui.text.submitButton = "Submit";
	ui.text.testResultLabel = "Result"";
	/**/
	/* JAPANESE VERSION */  
	ui.text.generationText = "問題を作成しています．...";
	ui.text.checkingText = "コードをチェックしています...";
	ui.text.correctText = "正解です！　すばらしい．";
	ui.text.wrongText = "残念．間違えです．もう一度やってみてください．";
	ui.text.task = "問題";
	ui.text.testButton = "コードの実行";
	ui.text.submitButton = "答案提出";
	ui.text.testResultLabel = "結果:";
	/**/
	
	system.mode = "native";
	system.currentProblem = 0;
	system.problem = {};
	
	ui.doc.testButtonText.text(ui.text.testButton);
	ui.doc.submitButton.text(ui.text.submitButton);
	ui.doc.testResultLabel.text(ui.text.testResultLabel);
		
	generateExercise();
}

function generateExercise() {
	openOverlay();
	ui.overlay.loadingPanel.css("visibility", "visible");
	ui.overlay.notificationPanel.css("visibility", "hidden");
	ui.overlay.loadingText.text(ui.text.generationText);
	
	function initializeProblem() {
		closeOverlay();
		ui.editor.setValue("");
		ui.doc.taskHeading.text(ui.text.task + " " + system.currentProblem);
		ui.doc.functionHeader.text(system.problem.functionHeader);
		ui.doc.exerciseText.html(system.problem.text.replace(/\[LB\]/g, "<br />"));
		ui.doc.testPanelInputList.html("");
		ui.doc.testResultText.text("");
		for (var i = 0; i < system.problem.inputSymbols.length; i++) {
			ui.doc.testPanelInputList.append("<div class=\"test-panel-group\"><label class=\"test-panel-label\">" + system.problem.inputSymbols[i] + "</label><input class=\"test-panel-input\" type=\"text\" /></div>");
		}
		$(".test-panel-input").on("input", function() {
			ui.doc.testResultText.text("");
		});
	}
	
	var url;
	if (system.mode == "native") {
		url = "exercise/native";
	}
	else if (system.mode == "planner") {
		url = "exercise/planner";
	}
	$.ajax({
		url: url,
		type: "get",
		dataType: "json",
		success: function(data) {
			system.currentProblem++;
			system.problem.text = data.text;
			system.problem.functionHeader = data.functionHeader;
			system.problem.testCases = data.testCases;
			system.problem.inputSymbols = data.inputSymbols;
			initializeProblem();
		},
		error: function() {
			console.log("Error fetching exercise");
		}
	});
}

function testCode() {
	ui.doc.testButton.css("visibility", "hidden");
	ui.doc.testSpinner.css("visibility", "visible");
	ui.doc.testResultText.text("");
	$.ajax({
		url: "code/test",
		type: "POST", 
		dataType: "json",
		data: {
			code: buildCode(),
			testParameters: JSON.stringify(getTestParameters())
		},
		success: function(data) {
			ui.doc.testButton.css("visibility", "visible");
			ui.doc.testSpinner.css("visibility", "hidden");
			if (data.status == "success") {
				ui.doc.testResultText.text(data.returnValue);
			}
			else {
				ui.doc.testResultText.text("Error.");
			}
		},
		error: function() {
			console.log("Error testing code.");
		}
	});
}

function submitCode() {
	openOverlay();
	ui.overlay.loadingPanel.css("visibility", "visible");
	ui.overlay.notificationPanel.css("visibility", "hidden");
	ui.overlay.loadingText.text(ui.text.checkingText);
	
	function displayCorrect() {
		ui.overlay.loadingPanel.css("visibility", "hidden");
		ui.overlay.notificationPanel.css("visibility", "visible");
		ui.overlay.notificationIconCorrect.css("display", "block");
		ui.overlay.notificationIconWrong.css("display", "none");
		ui.overlay.notificationText.text(ui.text.correctText);
	}
	
	function displayWrong() {
		ui.overlay.loadingPanel.css("visibility", "hidden");
		ui.overlay.notificationPanel.css("visibility", "visible");
		ui.overlay.notificationIconCorrect.css("display", "none");
		ui.overlay.notificationIconWrong.css("display", "block");
		ui.overlay.notificationText.text(ui.text.wrongText);
	}
	
	$.ajax({
		url: "code/submit",
		type: "POST", 
		dataType: "json",
		data: {
			code: buildCode(),
			testCases: JSON.stringify(system.problem.testCases)
		},
		success: function(data) {
			if (data.status == "passed") {
				displayCorrect();
				ui.overlay.notificationButton.off();
				ui.overlay.notificationButton.on("click", generateExercise);
			}
			else {
				displayWrong();
				ui.overlay.notificationButton.off();
				ui.overlay.notificationButton.on("click", closeOverlay);
			}
		},
		error: function() {
			console.log("Error checking code.");
		}
	});
}

function buildCode() {
	var res = system.problem.functionHeader;
	var body = ui.editor.getValue();
	var close = "}";
	var code = res + body + close;
	return code;
}

function getTestParameters() {
	var parameters = [];
	ui.doc.testPanelInputList.children(".test-panel-group").each(function() {
		parameters.push($(this).children(".test-panel-input").val());
	});
	return parameters;
}

function openOverlay() {
	ui.overlay.overlay.css("visibility", "visible");
	ui.overlay.fakeOverlay.css("visibility", "visible");
}

function closeOverlay() {
	ui.overlay.overlay.css("visibility", "hidden");
	ui.overlay.fakeOverlay.css("visibility", "hidden");
	ui.overlay.loadingPanel.css("visibility", "hidden");
	ui.overlay.notificationPanel.css("visibility", "hidden");
}