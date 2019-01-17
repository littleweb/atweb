module.exports = () => {
	return {
	    "apps": [{
	        "name": "app",
	        "script": "/node_modules/atweb/bin/web.js",
	        "args": "/atweb/app online",
	        "node_args": "--max-old-space-size=4096",
	        "instances": 3,
	        "cwd": "/atweb",
	        "autorestart": true,
	        "watch": false,
	        "ignore_watch" : [".git", ".tpl"],
	        "error_file" : "/data/logs/pm2/error.log",
	        "out_file"   : "/data/logs/pm2/output.log",
	    }]
	};
}