//This file configures the settings app.js needs to run.
//Copy it to 'appconfig.js' next to app.js, and modify it with your values.
module.exports = {
	webServerPort: 8082,
	socketServerPort: 8081,
	//https://github.com/felixge/node-mysql#connection-options
	mysqlConnectionOptions: {
		host: 		'localhost',
		user: 		'moodle',
		password: 	'takiko2005',
		database: 	'moodle27x'
	},
	timezoneEnvironment: 'Asia/Tokyo',
	moodleUrl: 'http://m27.poodll.com'
};