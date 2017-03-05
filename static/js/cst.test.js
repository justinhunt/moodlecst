cst.test = (function ($) {
	"use strict";

	// Private
	var 
		data = {},
		callbacks = $.Callbacks('unique'),
		session = [];
	
	var initTestState = function(otherStateData){
		var toState = {};
		if (typeof otherStateData != 'undefined'){
			$.extend(toState, otherStateData);
		}
		if (typeof data.id !== 'undefined'){
			toState.testId = data.id;
		}
		if (data.tasks.length > 0 && session.length > 0 ){
			toState.taskId = session[0];
		}
		console.log('Now initing test state');
		cst.state.data('initteststate',toState);
		
	};

	var getTasks = function(){
		return data.tasks;

	};
		
	var getTaskById = function(qid){
		var qs = $.grep(data.tasks, function(q,i){
			return (q.id == qid);
		});
		
		if (qs.length > 0){
			return qs[0];
		}else{
			throw "getTaskById called with " + qid + " but no task was found";
		}
	};

	
	var nextTask = function(onsuccess,onfailure){
		var isucat= $('#ucatenabled').attr('value');
		if(isucat=='1') {
			nextTaskFromMoodle(onsuccess,onfailure);
        }else {
            nextTaskByIncrement(onsuccess,onfailure);
        }
	};

    var nextTaskByIncrement = function(onsuccess,onfailure){

        //console.log('TID:' + cst.state.data().taskId);
        var task = getTaskById(cst.state.data().taskId);

        var idx = $.inArray(task.id, session);

        if (idx != -1 && session.length > (idx + 1)){
            var thetask = getTaskById(session[idx + 1]);
            onsuccess(thetask);
        }else{
            onfailure();
        }
    };

    //params eg = {type: 'partnerdetails', userId: '13'}
    //returned data = {type: 'partnerdetails', userName: 'Bob Jones', userPic: 'http://path.to.pic'}
    var nextTaskFromMoodle = function(onsuccess,onfailure){

        //this contains a collection of answer objects to data
        //and a collection of questions in the session
        var responsedata = JSON.stringify(cst.state.getOutput());
        var questiondata = JSON.stringify(session);
        var dataformoodle = {type: 'ucatnext',
            responsedata: responsedata,
            questiondata: questiondata,
            currenttaskid: cst.state.data().taskId,
            id: cst.state.data().activityId,
            sesskey: cst.state.data().sesskey
        };

        //could use cst.url().moodleurl in manual partner select (cos was passed in by form)
        var moodleurl = $('#moodleurl').attr('value');
        $.ajax({
            type: 'POST',
            url: moodleurl + '/mod/moodlecst/jsonmoodledata.php',
            data: dataformoodle,
            success: function(data, textStatus, jqXHR){
                if(data.next_task_id) {
                	var thetask = getTaskById(data.next_task_id);
                    onsuccess(thetask);
                }else {
                    onfailure();
                }

            },
            error: function(jqXHR, textStatus, errorThrown){
                cst.state.myStatus('fetchNextFromMoodleFail');
                cst.state.data('fetchNextFromMoodlefail', { sendResponse: jqXHR.status + ': ' + jqXHR.responseText });
                onfailure();
            },
            dataType: 'json'
        });
    };
	
	//REMEMBER, WRITES HERE OBLITERATE EXISTING DATA
	var protectedSession = function(ar){
		if (typeof ar !== 'undefined'){
			session = ar;
		}
		return session;
	}
	
	//REMEMBER, WRITES HERE OBLITERATE EXISTING DATA
	var protectedData = function(d){
		if (typeof d !== 'undefined'){
			data = d;
		}
		return data;
	};

	// Public
	return { // { must be on same line as return else semicolon gets inserted
		data: protectedData,
		session: protectedSession,
		getTaskById: getTaskById,
		nextTask: nextTask,
		initTestState: initTestState,
		getTasks: getTasks
	};
} (jQuery));


