cst.tasks = {};

cst.tasks.listen = (function ($) {
	"use strict";

	// Private
	var initQuestion = function($question, qData,state){
		$question.empty();
		$('#jpUITemplate').clone().attr('id', 'jpUI').show().appendTo($question);
		$question.find('div.jp-jplayer').jPlayer({
			ready: function(event) {
				//disable jplayer controls
				$('#jpUI').find('.jp-pause, .jp-play, .jp-stop').css('opacity', '.2').unbind('click');
				$(this).jPlayer("setMedia", {
					mp3: qData.content
				});
			},
			cssSelector: {
				play: "#goButton",
			},
			ended: function(event){
				cst.ui.defaultAnswersEnableMessage();
				/*
				cst.state.data({
					sharedStat: 'speakerGo', 
					taskStart: cst.timer.getTime(),
					studentLatency: cst.timer.getLatency()
				});
				cst.state.sendMessage({
					answersEnabled: 'true'
				});
				*/
				console.log(["play complete",event]);
			},
			supplied: "mp3"
		});
		cst.ui.startInstructions(state.data().taskId,state.data().mySeat);
		//this places a go button click before showing question
		cst.ui.initGoButton(function(){
				$('#go').hide();
				$question.find('audio').get(0).play();
			}
		);
	};
	
	var answerCallback = function(mdata){
		$.each(mdata, function(propname, propvalue){
			switch(propname){
				case 'answersEnabled':
					cst.ui.answersEnabled(true);
				break;
			}
		});
	};
	var questionCallback = function(state){};
	
	// Public
	return { // { must be on same line as return else semicolon gets inserted
		initQuestion: initQuestion,
		answerCallback: answerCallback,
		questionCallback: questionCallback
	};
} (jQuery));

cst.tasks.picture = (function ($) {
	"use strict";

	// Private
	var initQuestion = function($question, qData, state){
		$question.empty();
		$question.html('<img id="q1Img" class="questionImage" src="' + qData.content + '"/>' );
		cst.ui.startInstructions(state.data().taskId,state.data().mySeat);
		//this places a go button click before showing question
		cst.ui.initGoButton();
	};
	
	var initAnswers = function($answers, qData, state){
		$(qData.answers).each(function(i, x){
			$answers.append('<a class="answeritem" href="javascript:;" data-id="' + x.id + '"><img id="q1Img" class="questionImage" src="' + x.img + '"/></a>');
		});
		
	};
	
	var answerCallback = function(mdata){
		$.each(mdata, function(propname, propvalue){
			switch(propname){
				case 'answersEnabled':
					cst.ui.answersEnabled(true);
				break;
			}
		});
	};
	var questionCallback = function(state){};
	
	// Public
	return { // { must be on same line as return else semicolon gets inserted
		initQuestion: initQuestion,
		initAnswers: initAnswers,
		answerCallback: answerCallback,
		questionCallback: questionCallback
	};
} (jQuery));

cst.tasks.translate = (function ($) {
	"use strict";

	// Private
	var initQuestion = function($question, qData, state){
		$question.empty();
		var qhtml = '<div id="qTranslateSource" class="questionTranslateSource">' + qData.content.source + '</div>';
		qhtml += '<div id="qTranslateTarget" class="questionTranslateTarget">' + qData.content.target + '</div>';
		qhtml += '<a id="qTranslateHint" name="hintbutton" class="clickable">Show Hint</a>'; 
		qhtml +=  '<a id="qTranslateDone" name="donebutton" class="clickable">Done</a>';
		$question.html(qhtml);
		cst.ui.startInstructions(state.data().taskId,state.data().mySeat);
		cst.ui.initGoButton();
	};
	
	var initAnswers = function($answers, qData,state){
		$(qData.answers).each(function(i, x){
			//$answers.append('<a href="javascript:;" data-id="' + x.id + '"><img id="q1Img" class="questionImage" src="' + x.img + '"/></a>');	
			//var answerhtml='<div id="qTranslate" class="questionTranslate">' + x.text + '</div><br />';
			var answerhtml = '<div id="qTranslateSource" class="questionTranslateSource" style="display: none">' + qData.content.source + '</div>';
			answerhtml += 
			$answers.append(answerhtml);
		});
		
	};
	
	var answerCallback = function(mdata){
		
		$.each(mdata, function(propname, propvalue){
			if(propname=="clickedQuestionItem"){
				switch(propvalue){
					case 'hintbutton':
							console.log('hintbutton clicked over there');
							$('#qTranslateSource').show();
						break;
					case 'donebutton':
							console.log('donebutton clicked over there');
							//cst.ui.doTakeAnswer(1);
							/*
							cst.state.data({ taskEnd:cst.timer.getTime()});
							$('#answers').fadeOut('slow', function(){
								cst.state.takeAnswer(1);
							});
							*/
						break;
					default:
						console.log('another clickable clicked: ' + propname);
				}//end of switch
			}//end of propname
		});
	};
	
	var  questionCallback = function(mdata){
		$.each(mdata, function(propname, propvalue){
			if(propname=="clickedQuestionItem"){
				switch(propvalue){
					case 'hintbutton':
						console.log('hintbutton clicked HERE');
						$('#qTranslateHint').hide();
						break;
					case 'donebutton':
							console.log('donebutton clicked HERE');
							cst.ui.doTakeAnswer(1);
						break;
					default:
						console.log('another clickable clicked: ' + propname);
				}//end of switch
			}//end of propname
		});
	};
	
	
	// Public
	return { // { must be on same line as return else semicolon gets inserted
		initQuestion: initQuestion,
		initAnswers: initAnswers,
		answerCallback: answerCallback,
		questionCallback: questionCallback
	};
} (jQuery));

cst.tasks.consent = (function ($) {
	"use strict";

	// Private
	var initQuestion = function($question, qData){
		$question.empty();
		$question.html('<img id="q1Img" class="questionImage" src="' + qData.content + '"/>' );
		
	};
	
	var initAnswers = function($answers, qData){
		$(qData.answers).each(function(i, x){
			$answers.append('<a class="answeritem" href="javascript:;" data-id="' + x.id + '"><img id="q1Img" class="questionImage" src="' + x.img + '"/></a>');
		});
		
	};
	
	var answerCallback = function(state){};
	var questionCallback = function(state){};
	
	// Public
	return { // { must be on same line as return else semicolon gets inserted
		initQuestion: initQuestion,
		initAnswers: initAnswers,
		answerCallback: answerCallback,
		questionCallback: questionCallback
	};
} (jQuery));

cst.tasks.instructions = (function ($) {
	"use strict";

	// Private
	var initQuestion = function($question, qData){
		$question.empty();
		$question.html('<img id="q1Img" class="questionImage" src="' + qData.content + '"/>' );
	};
	
	var initAnswers = function($answers, qData){
		$(qData.answers).each(function(i, x){
			$answers.append('<a class="answeritem" href="javascript:;" data-id="' + x.id + '"><img id="q1Img" class="questionImage" src="' + x.img + '"/></a>');
		});
		
	};
	
	var answerCallback = function(state){};
	var questionCallback = function(state){};
	
	// Public
	return { // { must be on same line as return else semicolon gets inserted
		initQuestion: initQuestion,
		initAnswers: initAnswers,
		answerCallback: answerCallback,
		questionCallback: questionCallback
	};
} (jQuery));

cst.tasks.whowho = (function ($) {
	"use strict";

	// Private
	var initQuestion = function($question, qData){
		$question.empty();
		$question.html('<img id="q1Img" class="questionImage" src="' + qData.content + '"/>' );
	};
	
	var initAnswers = function($answers, qData){
		$(qData.answers).each(function(i, x){
			$answers.append('<a class="answeritem" href="javascript:;" data-id="' + x.id + '"><img id="q1Img" class="questionImage" src="' + x.img + '"/></a>');
		});
		
	};
	
	var answerCallback = function(state){};
	var questionCallback = function(state){};
	
	// Public
	return { // { must be on same line as return else semicolon gets inserted
		initQuestion: initQuestion,
		initAnswers: initAnswers,
		answerCallback: answerCallback,
		questionCallback: questionCallback
	};
} (jQuery));

cst.tasks.taboo = (function ($) {
	"use strict";

	var answerCallback = function(mdata){
		$.each(mdata, function(propname, propvalue){
			switch(propname){
				case 'answersEnabled':
					cst.ui.answersEnabled(true);
				break;
			}
		});
	
	};
	var questionCallback = function(state){};
	
	// Public
	return { // { must be on same line as return else semicolon gets inserted
		answerCallback: answerCallback,
		questionCallback: questionCallback
	};
} (jQuery));
