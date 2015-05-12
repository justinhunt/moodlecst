cst.event = (function ($) {
	"use strict";

	// Private
	var 
		statusChannel,
		presenceChannel,
		uOn = [],
		pusherCallbacks = $.Callbacks('unique'),
		presenceChanges = $.Callbacks('unique'),
		lastStash = 0,
		go =  { status: false, presence: false },
		socket;
	
	var init = function(callback){
		console.log('cst.events init...');

		socket = io.connect(cst.config.options().socketHost);


		socket.on('connect', function(data){
			console.log('connected to socket');
			socket.emit('join', { seat: cst.state.data().mySeat, 
			user: cst.state.data().userId, 
			activity: cst.state.data().activityId, 
			mode: cst.state.data().mode}); 
		});
		
		socket.on('joinedRoom', function(data){
			console.log('joinedroom');
			joinedRoom(data);
		});
		
		socket.on('presenceChange', function(data){
			console.log(data);
			presenceChange(data);
		});
		
		socket.on('stateChange', function(data){
			console.log(data);
			stateChange(data);		//TODO: CONSIDER DIRECT PASS HERE.. WHY THE EXTRA FUNCTION?
		});
		
		socket.on('newMessage', function(data){
			console.log(data);
			newMessage(data);	
		});
		
		socket.on('reset', function(data){
			document.location = './' + document.location.search;
		});
		
		socket.on('connect_failed', function (data) {
			console.log('socket connect failed');
			console.log(data);
		});
		
		socket.on('error', function (data) {
			console.log('socket error');
			console.log(data);
		});


		if (typeof callback === 'function'){
			callback();
		}
	};
	
	var initAllGo = function(){
		if (go.status && go.presence){
			presenceChanges.fire();
		}
	}
	
	var pusherFriendlyChannel = function(){
		return cst.state.data().channel.replace(' ', '');
	}
	
	
	//this is called a ton by our timer code, keep cache it.
	var usersOn = function(){
		if (lastStash < (new Date()).getTime() - 2000){
			lastStash = (new Date()).getTime();
			stashUsersOn();
		}
		return uOn;
	};
	
	var stashUsersOn = function(data){
		if (typeof data !== 'undefined'){
			uOn = $.map(data, function(v,k){ return k});
		}
	};
	
	var everybodyOn = function(){
		stashUsersOn();
		var seats = $.map(cst.config.seats(), function (v,k){ return k.toLowerCase()});
		//ugly one liner.  if seats and presence match, everone's on.
		return ($(seats).not(uOn).length == 0 && $(uOn).not(seats).length == 0);
	};
	
	
	var presenceChange = function(data){
		stashUsersOn(data);

		presenceChanges.fire(data);
		//blast out the current application state to them.
		//syncStatus(cst.state.syncData());
	};
		
	var pCallback = function(states){
		pusherCallbacks.fire(states);
	};
	
	var joinedRoom = function(data){

		//depending on the mode, we show 
		if(cst.state.data().mode=='teacherstudent'){
			var roomdetails = { channel: data.room, partnerId: data.partner};
		}else{
			var roomdetails = { channel: data.room, partnerId: data.partner, mySeat: data.seat};
		}
		//fetch user data for display
		cst.state.fetchMoodleData({type: 'mydetails', userId: cst.state.data().userId});
		cst.state.fetchMoodleData({type: 'partnerdetails', userId: data.partner});
		//broadcast and save changes
		cst.state.data(roomdetails, true);
	};
	
	var stateChange = function(data){
		var d = $.parseJSON(data);
		//send data to state and skip syncing
		if (d.from != cst.state.uniqueId()){
			cst.state.data(d.data,true);
		}
	};
	
	var newMessage = function(data){
		var d = $.parseJSON(data);
		//send data to state and skip syncing
		// we fire all messages even to the sender.
		//it is up to the event handlers to decide to ignore it or not
		cst.state.fireMessage(d.data);

	};
	
	var wrapper = function(data){
		return { "from": cst.state.uniqueId(), "data": data };
	};
	
	var sendMessage = function(data){
		var d = wrapper(data);
		cst.event.socket().emit(
			'newMessage', 
			{ 
				room: cst.state.data().channel,
				seat: cst.state.data().mySeat,
				messagePayload: JSON.stringify(d)
			}
		); 
	};
	
	var syncStatus = function(data){
		var d = wrapper(data);
		cst.event.socket().emit(
			'stateChange', 
			{ 
				room: cst.state.data().channel,
				seat: cst.state.data().mySeat,
				syncPayload: JSON.stringify(d)
			}
		); 
	};
	
	var reset = function(data){
		cst.event.socket().emit('reset', data);
	}
	
	// Public
	return { // { must be on same line as return else semicolon gets inserted
		init: init,
		reset: reset,
		syncStatus: syncStatus,
		pusherCallbacks: pusherCallbacks,
		presenceChanges: presenceChanges,
		presenceChannel: function(){ return presenceChannel },
		usersOn: usersOn,
		sendMessage: sendMessage,
		everybodyOn: everybodyOn,
		socket: function(){ return socket }
	};
} (jQuery));


