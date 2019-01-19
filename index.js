const Hapi = require('hapi');
const Path = require('path');
const atweb = require('./lib/atweb');
const Disk = require('catbox-disk');
const fs = require('fs');

module.exports = (args) => {
	args = args.split(',');
	let dirname = args[0];
	global.DEV = args[1] == 'dev'?true:false;
	let _package = require(`${dirname}/package.json`);
	let config = require(`${dirname}/config.json`);
	global.CONF = config;
	if(fs.existsSync(`${dirname}/_config.json`)){
		global.CONF = require(`${dirname}/_config.json`);
	}
	if(!fs.existsSync(`/data/hapi`)){
		fs.mkdirSync(`/data/hapi`);
		fs.mkdirSync(`/data/hapi/cache`);
	}
	const server = Hapi.server(
		{
			port: 80,
            state: {
                strictHeader: false,
                clearInvalid: true
            }
		}
	);
	//全局引用HAPI
	global.HAPI = server;
	global.HAPI.event('docker:done');
	global.HAPI.event('mongo:done');
	(async () => {
		console.time('start');
		//注册hapi插件
		await server.register(require('./lib/hapi/plugin')(global.CONF));
		var cat = new atweb({
			namespace: _package.name,
			name: _package.name,
			url: null,
			dirname: '',
			parent: null,
			_package,
			config
		});
		//加载root
		cat.use('/', dirname);
		//加载插件
		cat.use('/$/redis', Path.resolve(__dirname + '/lib/plugin/redis'));
		cat.use('/$/redis/kv', Path.resolve(__dirname + '/lib/plugin/redis/kv.js'));
		cat.use('/$/util', Path.resolve(__dirname + '/lib/plugin/util'));
		cat.use('/$/view', Path.resolve(__dirname + '/lib/plugin/view'));
		cat.use('/$/auth', Path.resolve(__dirname + '/lib/plugin/auth'));
		cat.use('/$/docs', Path.resolve(__dirname + '/lib/plugin/docs'));
		cat.use('/$/model', Path.resolve(__dirname + '/lib/plugin/model'));
		cat.use('/$/config', Path.resolve(__dirname + '/lib/plugin/config'));
		cat.use('/$/__docker', Path.resolve(__dirname + '/lib/plugin/docker'));
		cat.use('/$/service', Path.resolve(__dirname + '/lib/plugin/service'));
		cat.use('/$/axios', Path.resolve(__dirname + '/lib/plugin/httpclient'));
		
		//转化成hapi路由
		global.ATWEB.rmap.forEach(ritem => {
			(function(route){
				if(!(route.path.indexOf("/$") > -1)){
					route.config.handler = async function(request, h){
						if(route.module.auth.authLogin){
							let login = route.loginFn(request, h);
							if(!login){
								return h.redirect(ritem.loginUrl);
							}
						}
				    	//扩展request
						request = require('./lib/hapi/request')(request);
				    	//扩展内容输出
				    	h._resHtml = '';
						h = require('./lib/hapi/h')(request, h, route);
						//执行业务代码
						await route.handler(request,h);
						if(route._before){
							let bres = await route._before(request,h);
							h._resHtml = bres || h._resHtml;
						}
						return h._resHtml;
				    };
			        route.config.tags = route.config.tags || [];
			        route.config.tags.push('api');
			        route.config.pre = route.config.pre || [];
			        route.config.pre.push({
						'method': (request, h) => {
							// request.session.__name = "oncer";
				            request.data = request.data || {};
							return h.continue;
						}
					});
					if(route._before){
				        route.config.pre.push({
							'method': async (request, h) => {
								request = require('./lib/hapi/request')(request);
								let bres = await route._before(request,h);
								return (bres || h.continue);
							}
						});					
					}
					server.route({
					    path: route.path,
					    method: route.method,
					    config: route.config
					});
					// console.log(`${route.path} 载入成功`);
				}
			})(ritem);
		});
		//启动hapi服务	
	    await server.start();
		console.timeEnd('start');
	    console.log(`应用启动成功`);
	    console.log(`访问地址: http://localhost:${config.port}`);
	})();

	server.cache({
        name      : 'diskCache',
        engine    : Disk,
        cachePath: '/data/hapi/cache',
        cleanEvery: 3600000,
        partition : 'cache'
    });

  //   server.cache(
		// {
		// 	name: 'session',
		// 	segment: 'session',
		// 	engine: require('catbox-redis'),
		// 	host: (global.CONF
		// 		&& global.CONF.session
		// 		&& global.CONF.session.redis
		// 		&& global.CONF.session.redis.host) || (global.CONF.model
		// 		&& global.CONF.model.redis
		// 		&& global.CONF.model.redis.host) || 'atweb-redis',
		// 	port: (global.CONF
		// 		&& global.CONF.session
		// 		&& global.CONF.session.redis
		// 		&& global.CONF.session.redis.port) || (global.CONF.model
		// 		&& global.CONF.model.redis
		// 		&& global.CONF.model.redis.port) || '6379',					
		// 	password: (global.CONF
		// 		&& global.CONF.session
		// 		&& global.CONF.session.redis
		// 		&& global.CONF.session.redis.password) || (global.CONF.model
		// 		&& global.CONF.model.redis
		// 		&& global.CONF.model.redis.password) || '',					
		// 	database: (global.CONF
		// 		&& global.CONF.session
		// 		&& global.CONF.session.redis
		// 		&& global.CONF.session.redis.db) || (global.CONF.model
		// 		&& global.CONF.model.redis
		// 		&& global.CONF.model.redis.db) || ''
		// }
  //   );
}