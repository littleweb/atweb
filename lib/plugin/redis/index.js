module.exports = app => {
	// app.EC.on('docker:done', (yml) => {
		// if(yml.indexOf('atweb-redis') > -1){
			if(global.CONF && global.CONF.model && global.CONF.model.redis){
				let port = '6379',
					host = 'atweb-redis',
					option = {};
				let redisConf = global.CONF && global.CONF.model && global.CONF.model.redis?global.CONF.model.redis:null;
				host = redisConf?redisConf.host:host;
				if(redisConf && redisConf.password){
					option.password = redisConf.password;
				}			
				if(redisConf && redisConf.db){
					option.db = redisConf.db;
				}
				let redisClient  = require('redis').createClient(port, host, option);
				redisClient.on('ready', () => {
					console.log(`redis连接成功: ${host}:${port}`);
				});
				let redis = {
					"get": function(key){
						return new Promise(function(resolve, reject){
							redisClient.get(key,function(err,data){
								data = data == "NaN"?'':data;
								err && reject(err);
								resolve(data);
							});
						})
					},	
					"set": function(key,value){
						redisClient.set(key,value);
					},
				    "hset": function(){
				    	let args = Array.from(arguments);
				    	redisClient.hset(args);
				    },
					"hmset": function(key,vo){
				    	redisClient.hmset(key,vo);
				    },
					"hget": function(key){
				    	return new Promise(function(resolve, reject){
				        	redisClient.hgetall(key,function(err,data){
				            	err && reject(err);
				            	resolve(data);
				            });
				        })
					},
					"client": redisClient
				};
				app.addMethod("redis", redis);
			}
		// }
	// });
}