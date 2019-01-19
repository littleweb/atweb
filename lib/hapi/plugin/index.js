module.exports = (config,path) => {
	let list = [
		{
		    plugin: require('hapi-auth-basic'),
		    options: {}
		},	
		{
			plugin: require('hapi-server-session'),
			options: {
				name: 'sid',
				cookie: {
					ttl: 365 * 24 * 60 * 60 * 1000,
					path: '/',
					isSecure: false
				},
				cache: {
					cache: 'session'
				}
			}
		},	
		{
		    plugin: require('vision'),
		    options: {}
		},
		// //静态资源插件
		{
		    plugin: require('inert'),
		    options: {}
		},		
		{
		    plugin: require('h2o2'),
		    options: {}
		},			
		//静态资源插件
		{
		    plugin: require('./static'),
		    options: {
		    	path: path,
		    	config: config['static'] || null
		    }
		},
		//模板插件
		{
		    plugin: require('./tpl'),
		    options: {
		    	config: config.view
		    }
		},	
		//错误代码		
		{
			plugin: require('./errer-code'),
			options: {
		    	config: config.errerCode || null
			}
		}
	];
	if(config['atweb-docs']){
		//API文档插件
		list.push(
			{
			    plugin: require('hapi-swagger'),
			    options: {
					info: {
		                title: '文档',
		                version: 'v9.1.1',
		            },
		            host: `localhost:${config.dockerPort}`,
					consumes: ['application/json'],
					payloadType: 'form',
					lang: 'zh-cn'
			    }
			}
		);
	}
	return list;
}