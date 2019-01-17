module.exports = () => {
	let config = require(process.argv[2]);
	let nowatch = ["/atweb/app/.git/**", ".tpl", "/atweb/app/web"];
	if(config.pm2 && config.pm2.nowatch){
		nowatch = [...nowatch, ...config.pm2.nowatch];
	}
	return {
	    "apps": [{
	        "name": "app",
	        "script": "/node_modules/atweb/bin/web.js",
	        "args": "/atweb/app dev",
	        "cwd": "/atweb",
	        "autorestart": true,
	        "watch": "/atweb/app",
	        "ignore_watch" : nowatch,
	        "error_file" : "/data/logs/pm2/error.log",
	        "out_file"   : "/data/logs/pm2/output.log",
	        "watch_options": {
	            "usePolling": true
	        }
	    }]
	};
}