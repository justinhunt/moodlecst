cst.config = (function($){
	var 
		tt = {},
		s = {},
		options = {},
		ttn = '',
		sessions = [],
		loadFlags = {		//used to set up a bunch of latches that hold some operations until a series of asynchronous actions are complete
			config: false,
			sessions: false,
			tasks: false,
			consent: false,
			instructions: false
		};
	
	var init = function(fCallback){
		console.log('cst.config init...');
		//CONFIG INIT
		$.ajax({
			url: '/config/config.js',
			dataType: 'json',
			success: function (d){
				if (typeof d.taskTypes !== 'undefined'){
					tt = d.taskTypes;
				}
				if (typeof d.seats !== 'undefined'){
					s = d.seats;
				}
				if (typeof d.options !== 'undefined'){
					options = d.options;
					loadTasksSessions(fCallback);
				}
				ttn = $.map(tt, function(val, i){
					return i
				}).join(" ");
				
				loadFlags.config = true;
				isConfigFinished(fCallback);
			},
			error: function(jqXHR, textStatus, errorThrown){
				throw errorThrown;
			}
		});
		
		//CONSENT CONTENT INIT
		$.ajax({
			url: '/content/consent.htm',
			dataType: 'html',
			success: function(d){
				if (d){
					//TODO: MOVE THIS TO UI
					$('#consent').html(d);
				}else{
					throw "No consent content received";
				}
				
				loadFlags.consent = true;
				isConfigFinished(fCallback);
			},
			error: function(jqXHR, textStatus, errorThrown){
				throw errorThrown;
			}
		});
		
		//INSTRUCTIONS CONTENT INIT
		$.ajax({
			url: '/content/instructions.htm',
			dataType: 'html',
			success: function(d){
				if (d){
					//TODO: MOVE THIS TO UI
					$('#generalInstructions').html(d);
				}else{
					throw "No instructions content received";
				}
				
				loadFlags.instructions = true;
				isConfigFinished(fCallback);
			},
			error: function(jqXHR, textStatus, errorThrown){
				throw errorThrown;
			}
		});
	};
	
	var sessionPath = function(){
		var file = 'default';
		if (typeof cst.url().tasks !== 'undefined'){
			file = cst.url().tasks;
		}
		return options.moodleUrl + '/mod/moodlecst/jsonsessions.php?id='+ cst.url().activityid + '&sesskey=' + cst.url().sesskey;
	};
	
	var taskPath = function(){
		var file = 'default';
		if (typeof cst.url().tasks !== 'undefined'){
			file = cst.url().tasks;
		}
		return  options.moodleUrl + '/mod/moodlecst/jsontasks.php?id='  + cst.url().activityid + '&sesskey=' + cst.url().sesskey;
	};

	//this needs to be called after options are loaded, to get the moodle url
	var loadTasksSessions = function(fCallback){
		$.ajax({
			url: sessionPath() + '&t=' + (new Date()).getTime(),
			dataType: 'json',
			success: function(d){
				console.log('loadedsession');
				if (typeof d !== 'undefined'){
					sessions = d;
					loadFlags.sessions = true;
					isConfigFinished(fCallback);
				}
			},
			error: function(jqXHR, textStatus, errorThrown){
				throw errorThrown;
			}
		});

		//TASK INIT
		console.log('loadingtasks');
		$.ajax({
			url: taskPath() + '&t=' + (new Date()).getTime(),
			dataType: 'json',
			success: function(d){
				console.log('loadedtasks');
				if (d.test){
					cst.test.data(d.test);
				}else{
					throw "No test payload received";
				}
				
				loadFlags.tasks = true;
				isConfigFinished(fCallback);
			},
			error: function(jqXHR, textStatus, errorThrown){
				throw errorThrown;
			}
		});
	};
	
	//Harnesses all the ajax actions to not fire a 'finished' callback until they've all called back.
	var isConfigFinished = function(fCallback){
		var b = true;
		$.each(loadFlags, function(k, v){
			b = b && v;
		});
		if (b){
			fCallback();
		}
	};

	
	//Returns the name of the 'other' seat (first non matching seat from config)
	var otherSeat = function(mySeat){
		return $.map(seats(),function(v,k){ if (k != mySeat) return k })[0];
	};

	var sessions = function(){ return sessions; };

	var taskTypes = function(){ return tt; };
	
	var taskTypeNames = function (){ return ttn; };
	
	var seats = function(){ return s; };
	
	var options = function(){ return options; };
	
	return {
		init: init,
		taskTypes: taskTypes,
		seats: seats,
		taskTypeNames: taskTypeNames,
		otherSeat: otherSeat,
		sessions: sessions,
		options: options
	};
}(jQuery));