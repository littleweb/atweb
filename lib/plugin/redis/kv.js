module.exports = async (app) => {
	function kv(key){
		let me = this;
		me.key = key;
		me.type = () => {
			return new Promise((res,rej) => {
				console.log(me.key);
				app.redis.client.type(me.key, (err, result) => {
					console.log(result);
					res(result);
				});
			});
		};
		//set&get
		me.val = me.value = async (value) => {
			console.log(key);
			if(key.split('.').length > 1){
				key = key.split('.');
				if(value){
					let type = typeof(value);
					if(type == 'object'){
						return app.redis.client.hset(key[0], key[1], JSON.stringify(value));
					}else{
						return app.redis.client.hset(key[0], key[1], value);
					}
				}else{
					return new Promise((res,rej) => {
						app.redis.client.hget(key[0], key[1], async function (err, result) {
							console.log(err);
							if(!null){
								try{
									result = JSON.parse(result);
								}catch(e){}
			                	res(result);
							}else{
								res(null);
							}
			            });
					});				
				}				
			}else{
				if(value){
					let type = typeof(value);
					if(type == 'string' || type == 'number'){
						return app.redis.client.set(key, value);
					}
					if(type == 'object' && Array.isArray(value)){
						value.forEach((item,index) => {
							value[index] = (typeof(item) == 'object' || typeof(item)=='array')?JSON.stringify(item):item;
						});
						return app.redis.client.rpush(key, value);
					}
					if(type == 'object' && Object.prototype.toString.call(value).toLowerCase() == "[object object]"){
						return app.redis.client.set(key, JSON.stringify(value));
					}
					if(type == 'function'){
						let rresult = await me.val();
						if(rresult){
							return rresult;
						}else{
							rresult = await value();
							me.val(rresult);
							return rresult;
						}
					}
				}else{
					return new Promise((res,rej) => {
						let rrsult = '';
						app.redis.client.type(key, (err, result) => {
							if(result == 'none'){
								res(false);
							}
							if(result == 'string'){
								app.redis.client.get(key, async function (err, result) {
									if(!null){
										try{
											result = JSON.parse(result);
										}catch(e){}
					                	res(result);
									}else{
										// res(src());
										res(null);
									}
					            });
							}
							if(result == 'hash'){
								app.redis.client.hgetall(key, async function (err, result) {
									if(!null){
										for(let key in result){
											try{
												result[key] = JSON.parse(result[key]);
											}catch(e){}
										}
										res(result);
									}else{
										// res(src());
										res(null);
									}
					            });
							}							
							if(result == 'list'){
								app.redis.client.lrange(me.key,0,-1, async function (err, result) {
									if(!null){
										for(let key in result){
											try{
												result[key] = JSON.parse(result[key]);
											}catch(e){}
										}
										res(result);
									}else{
										// res(src());
										res(null);
									}
					            });
							}
						});
					});				
				}
			}
		};
		//删除key
		me.del = me.delete = async () => {
			if(me.key.split('.').length > 1){
				key = me.key.split('.');
				app.redis.client.hdel(key[0], key[1], async function (err, result) {
	                res(result);
	            });
			}else{
				app.redis.client.del(me.key, async function (err, result) {
	                res(result);
	            });
			}		
		};
		//检测key是否存在	
		me.have = async () => {
			return new Promise((res,rej) => {
				if(me.key.split('.').length > 1){
					key = me.key.split('.');
					app.redis.client.hexists(key[0], key[1], async function (err, result) {
		                res(result);
		            });
				}else{
					app.redis.client.exists(me.key, async function (err, result) {
		                res(result);
		            });
				}
			});			
		};
		//list：unshift
		me.unshift = async (value) => {
			let type = await me.type();
			if(type == 'list'){
				return new Promise((res,rej) => {
					value = (typeof(value) == 'object' || typeof(value)=='array')?JSON.stringify(value):value;
					if(me.key.split('.').length > 1){
						key = me.key.split('.');
						app.redis.client.lpush(key[0], key[1], value, async function (err, result) {
			                res(result);
			            });
					}else{
						app.redis.client.lpush(me.key, value, async function (err, result) {
			                res(result);
			            });
					}
				});			
			}else{
				return false;
			}
		};		
		//list：push	
		me.push = async (value) => {
			let type = await me.type();
			console.log(type);
			if(type == 'list' || type == 'none'){
				return new Promise((res,rej) => {
					value = (typeof(value) == 'object' || typeof(value)=='array')?JSON.stringify(value):value;
					if(me.key.split('.').length > 1){
						key = me.key.split('.');
						app.redis.client.rpush(key[0], key[1], value, async function (err, result) {
			                res(result);
			            });
					}else{
						app.redis.client.rpush(me.key, value, async function (err, result) {
			                res(result);
			            });
					}
				});			
			}else{
				return false;
			}
		};		
		//list：pop
		me.pop = async () => {
			let type = await me.type();
			if(type == 'list'){
				return new Promise((res,rej) => {
					if(me.key.split('.').length > 1){
						key = me.key.split('.');
						app.redis.client.rpop(key[0], key[1], async function (err, result) {
			                res(result);
			            });
					}else{
						app.redis.client.rpop(me.key, async function (err, result) {
			                res(result);
			            });
					}
				});			
			}else{
				return false;
			}
		};		
		//list：shift
		me.shift = async () => {
			let type = await me.type();
			if(type == 'list'){
				return new Promise((res,rej) => {
					if(me.key.split('.').length > 1){
						key = me.key.split('.');
						app.redis.client.lpop(key[0], key[1], async function (err, result) {
			                res(result);
			            });
					}else{
						app.redis.client.lpop(me.key, async function (err, result) {
			                res(result);
			            });
					}
				});			
			}else{
				return false;
			}
		};		
		//list：index
		me.index = async (index) => {
			let type = await me.type();
			if(type == 'list'){
				return new Promise((res,rej) => {
					if(me.key.split('.').length > 1){
						key = me.key.split('.');
						app.redis.client.lindex(key[0], key[1], index, async function (err, result) {
                			for(let key in result){
								try{
									result[key] = JSON.parse(result[key]);
								}catch(e){}
							}
			                res(result);
			            });
					}else{
						app.redis.client.lindex(me.key, index, async function (err, result) {
                			for(let key in result){
								try{
									result[key] = JSON.parse(result[key]);
								}catch(e){}
							}
			                res(result);
			            });
					}
				});			
			}else{
				return false;
			}
		};		
		//list：slice
		me.slice = async (start=0,end=-1) => {
			let type = await me.type();
			if(type == 'list'){
				return new Promise((res,rej) => {
					if(me.key.split('.').length > 1){
						key = me.key.split('.');
						app.redis.client.lrange(key[0], key[1], start, end, async function (err, result) {
                			for(let key in result){
								try{
									result[key] = JSON.parse(result[key]);
								}catch(e){}
							}
			                res(result);
			            });
					}else{
						app.redis.client.lrange(me.key, start, end, async function (err, result) {
                			for(let key in result){
								try{
									result[key] = JSON.parse(result[key]);
								}catch(e){}
							}
			                res(result);
			            });
					}
				});			
			}else{
				return false;
			}
		};
		//数据列表
		me.list = async () => {
			return new Promise((res,rej) => {
				let list = [];
				app.redis.client.keys('*', async function (err, keys) {
	                if (err) return console.log(err);
	                for(let i = 0;i < keys.length; i++){
	                	list.push(keys[i]);
	                    // var _data = await app.redis.get(keys[i]);
	                    // list.push({
	                    // 	[keys[i]]: _data
	                    // });
	                }
	                res(list);
	            });
			});
		};
		//获取数据长度
		me.len = me.length = async () => {
			console.log(me.key);
			return new Promise((res,rej) => {
				app.redis.client.type(me.key, (err, result) => {
					console.log(result);
					if(result == 'string'){
						app.redis.client.strlen(key, function (err, result) {
							if(!null){
								res(result);
							}else{
								res(0);
							}
			            });
					}					
					if(result == 'list'){
						app.redis.client.llen(key, function (err, result) {
							if(!null){
								res(result);
							}else{
								res(0);
							}
			            });
					}
					if(result == 'hash'){
						app.redis.client.hlen(key, function (err, result) {
							if(!null){
								res(result);
							}else{
								res(0);
							}
			            });
					}
				});			
			});	
		};
		//数据源
		me.src = async(cb) => {
			let result = await cb();
			console.log(result);
		}
		return me;
	}
	app.addMethod("kv", kv);
}