cst.state = (function ($) {
	"use strict";

	// Private
	var 
		data = {
			channel: '',
			sessionId: 0,		//sync
			raterId: 0,			//sync
			studentId: 0,		//sync
			testId: 0,
			taskId: 0,			//sync	//questionpop
			taskStart: 0,			//sync
			taskEnd: 0,			//sync
			studentLatency: 0,
			mySeat: '',	//student or teacher, more permanent than 'hat' = respondent, speaker
			studentStat: '',
			teacherStat: '',
			sharedStat: '',
			consentGiven: false,
			beginClicked: false,
			sesskey: '',
			userId: 0,
			userName: '',
			userPic: '',
			partnerId: 0,
			partnerName: '',
			partnerPic: '',
			activityId: 0,
			mode: 0,
		},
		output = [],
		callbacks = $.Callbacks('unique');
	
	var syncData = function(){
		return {
			raterId: data.raterId,
			studentId: data.studentId,
			sessionId: data.sessionId,
			testId: data.testId,
			taskId: data.taskId,
			taskStart: data.taskStart,
			taskEnd: data.taskEnd,
			studentStat: data.studentStat,
			teacherStat: data.teacherStat,
			sharedStat: data.sharedStat,
			studentLatency: data.studentLatency,
			consentGiven: data.consentGiven,
			beginClicked: data.beginClicked
		};
	};
	
	var status = function(value){
		if (typeof value !== 'undefined'){
			cst.state.data({ sharedStat: value });
		}
		return cst.state.data().sharedStat;
	};
	
	var isStatus = function(arrStats){
		return ($.inArray(status(), arrStats) != -1);
	};
		
	var myStatus = function(value){
		if (data.mySeat == ''){
			throw "Seat undefined, myStatus called, that's bad.";
		}
		var obj = {};
		obj[data.mySeat.toLowerCase()+"Stat"] = value;
		
		if (typeof value !== 'undefined'){
			cst.state.data(obj);
		}
		return cst.state.data()[data.mySeat.toLowerCase()+"Stat"];
	};
	
	var theirStatus = function(){
		if (data.mySeat == ''){
			throw "Seat undefined, theirStatus called, that's bad.";
		}
		return cst.state.data()[cst.config.otherSeat(data.mySeat).toLowerCase()+"Stat"];
	};
	
	var myHat = function(taskType){
		if (! cst.config.seats()) throw "No seats, can't determine who you are";
		if (! data.mySeat.length > 0) throw "can't find your hat if we don't know your seat";	 
		if (! taskType || (taskType != "Productive" && taskType != "Receptive")){
			//try to find task type by state.
			var task = cst.test.getTaskById(data.taskId);
			if (! task){
				throw "Task type wasn't recognized and couldn't be found.  therefore your hat couldn't be found.";
			}else{
				taskType = task.type;
			}
		}
		
		return cst.config.seats()[data.mySeat.toTitleCase()][taskType];
	};
	
	
	var protectedData = function(newData, skipSync){
		if (newData){
			if (!skipSync){
				var toSync = {};
				$.each(newData, function(k, v){
					if (typeof syncData()[k] !== "undefined" && data[k] != v){
						toSync[k] = v;
					}
				});
				if (!$.isEmptyObject(toSync)){
					cst.event.syncStatus(toSync);
				}
			}
			
			var oldSessionId = data.sessionId;
			$.extend(true, data, newData);
			callbacks.fire(this);
		}
		return data;
	};
	
	var emergencySync = function(){
		cst.event.syncStatus(syncData());
		callbacks.fire(this);
	};
	
	
	var takeAnswer = function(answerId){
		
		var currentTask,
			taskAnswer,
			answer,
			isCorrect;

		currentTask  = cst.test.getTaskById(cst.state.data().taskId);	
			
		if (currentTask){
			taskAnswer = $.grep(currentTask.answers, function(v, k){
				return (typeof v.correct !== 'undefined' && v.correct == true);
			})[0];
		}
		if (typeof taskAnswer != 'undefined'){
			isCorrect = (taskAnswer.id == answerId);
		}
		
		
		var answer = cst.response.create(answerId, isCorrect);
		
		output.push(answer);
		
		//set answered, for callbacks
		cst.state.data({ sharedStat: 'answered'}, true);
		
		var task = cst.test.nextTask();
		if (task){
			cst.state.data({ 
				taskId: task.id,
				sharedStat: 'taskStart',
				studentStat: '',
				teacherStat: '',
				taskStart: 0,
				taskEnd:0
			});
		}else{
			sendResults();
		}
		
		
	};
	//params eg = {type: 'partnerdetails', userId: '13'}
	//returned data = {type: 'partnerdetails', userName: 'Bob Jones', userPic: 'http://path.to.pic'}
	var fetchMoodleData = function(fetchparams){
		fetchparams.sesskey = data.sesskey;
		fetchparams.id = data.activityId;
		$.ajax({
			type: 'POST',
			url: cst.config.options().moodleUrl + '/mod/moodlecst/jsonmoodledata.php',
			data: fetchparams,
			success: function(data, textStatus, jqXHR){
				switch(data.type){
					case 'partnerdetails':
						cst.state.data({userName: data.userName, userPic: data.userPic},true);
						break;
					case 'mydetails':
					default:
						cst.state.data({partnerName: data.userName, userPic: data.userPic},true);
				}
			},
			error: function(jqXHR, textStatus, errorThrown){
				cst.state.myStatus('fetchFail');
				cst.state.data({ sendResponse: jqXHR.status + ': ' + jqXHR.responseText });
			},
			dataType: 'json'
		});
	}
	
	var sendResults = function(){
	
		cst.state.data({
			taskId: 0,
			sharedStat: 'done',
			studentStat: '',
			teacherStat: '',
			taskStart: 0,
			taskEnd:0
		});
		
		
		debugger;

		$.ajax({
			type: 'POST',
			url: cst.config.options().moodleUrl + '/mod/moodlecst/jsonresults.php',
			data: { 
				'results' : JSON.stringify(output),
				'sesskey': data.sesskey,
				'userid' : data.userId,
				'id' : data.activityId
			},
			beforeSend: function(){
				cst.state.myStatus('sending');
			},
			success: function(data, textStatus, jqXHR){ 
				cst.state.myStatus('sendSuccess');
				cst.state.data({ sendResponse: data });
			},
			error: function(jqXHR, textStatus, errorThrown){
				cst.state.myStatus('sendFail');
				cst.state.data({ sendResponse: jqXHR.status + ': ' + jqXHR.responseText });
			},
			dataType: 'json'
		});
		
	}
	
	
	var uniqueId = function(){
		return data.mySeat;
	}
	
	var clearOutput = function(){
		output = [];
	}
	
	var getOutput = function(){
		return output;
	}
	
	// Public
	return { // { must be on same line as return else semicolon gets inserted
		data: protectedData,
		sendResults: sendResults,
		fetchMoodleData: fetchMoodleData,
		syncData: syncData,
		callbacks: callbacks,
		takeAnswer: takeAnswer,
		myHat: myHat,
		uniqueId: uniqueId,
		myStatus: myStatus,
		theirStatus: theirStatus,
		status: status,
		isStatus: isStatus,
		clearOutput: clearOutput,
		getOutput: getOutput,
		emergencySync: emergencySync
	};
} (jQuery));


