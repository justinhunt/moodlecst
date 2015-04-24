cst.tasks = {};

cst.tasks.listen = (function ($) {
	"use strict";

	// Private
	var initQuestion = function($question, qData){
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
				
				cst.state.data({
					sharedStat: 'speakerGo', 
					taskStart: cst.timer.getTime(),
					studentLatency: cst.timer.getLatency()
				});
				console.log(["play complete",event]);
			},
			supplied: "mp3"
		});
	};
	
	// Public
	return { // { must be on same line as return else semicolon gets inserted
		initQuestion: initQuestion
	};
} (jQuery));

cst.tasks.picture = (function ($) {
	"use strict";

	// Private
	var initQuestion = function($question, qData){
		$question.empty();
		$question.html('<img id="q1Img" class="questionImage" src="' + qData.content + '"/>' );
	};
	
	var initAnswers = function($answers, qData){
		$(qData.answers).each(function(i, x){
			$answers.append('<a href="javascript:;" data-id="' + x.id + '"><img id="q1Img" class="questionImage" src="' + x.img + '"/></a>');
		});
		
	};
	
	// Public
	return { // { must be on same line as return else semicolon gets inserted
		initQuestion: initQuestion,
		initAnswers: initAnswers
	};
} (jQuery));

cst.tasks.translate = (function ($) {
	"use strict";

	// Private
	var initQuestion = function($question, qData){
		$question.empty();
		var qhtml = '<div id="qTranslate" class="questionTranslateSource">' + qData.content.source + '</div>';
		qhtml += '<div id="qTranslate" class="questionTranslateTarget">' + qData.content.target + '</div>';
		$question.html(qhtml);
	};
	
	var initAnswers = function($answers, qData){
		$(qData.answers).each(function(i, x){
			//$answers.append('<a href="javascript:;" data-id="' + x.id + '"><img id="q1Img" class="questionImage" src="' + x.img + '"/></a>');	
			//var answerhtml='<div id="qTranslate" class="questionTranslate">' + x.text + '</div><br />';
			var answerhtml = '<a href="javascript:;" data-id="' + x.id + '">Done</a>';
			$answers.append(answerhtml);
		});
		
	};
	
	// Public
	return { // { must be on same line as return else semicolon gets inserted
		initQuestion: initQuestion,
		initAnswers: initAnswers
	};
} (jQuery));

/*
cst.tasks.taboo = (function ($) {
	"use strict";

	// Private
	var init = function($question, qData){
		$question.empty();
		$('#jpUI').clone().show().appendTo($question);
		$question.find('div.jp-jplayer').jPlayer({
		        ready: function(event) {
		            $(this).jPlayer("setMedia", {
				//BRING IN CST TEST DATA HERE
		                mp3: qData.content
		            });
		        },
		        supplied: "mp3"
		    });
	};
	
	// Public
	return { // { must be on same line as return else semicolon gets inserted
		init: init
	};
} (jQuery));
*/

