const Path = require('path');
const fs = require('fs');
//底层链
global.ATWEB = {
	//模块链
	mmap: {},
	//路由链
	rmap: [],
	//数据库链
	db: {
		mongo: {}
	},
	docker: {
		yml: []
	},
	web: ''
};
function atweb(option){
	var me = this;
	me.option = option;
	//引入模块
	me.use = (url, module) => {
		if(typeof(module) == 'string' && module.substring(0,4) == 'http'){
			me.proxy(url, module);
			return false;
		}
		if(!module){
			if(url.indexOf('/') > -1){
				module = `./${url}`;
			}else{
				module = url;
			}
		}
		module = module || `./${url}`;
		//解析模块路径
		let modulePath;
		if(module.charAt(0,1) == '.'){
			modulePath = option.dirname + module.replace('.', '');
		}else{
			modulePath = require.resolve(module).replace('index.js','');
		}
		modulePath = modulePath.replace(/\/\//g, '/');
		// console.log(modulePath);
		//加载目录
		if(modulePath.indexOf('*') > -1){
			let dirs = modulePath.replace('*', "");
			if(fs.existsSync(dirs)){
				let files = fs.readdirSync(dirs);
				files.forEach(function(ele,index){
					var t = `${dirs}${ele}`;
					//过滤隐藏文件
					if(!(ele.charAt(0,1) == '.')){
					    var info = fs.statSync(t);
					    let furl;
					    if(info.isDirectory()){
					    	furl = option.url?option.url + url + '/' + ele:'';
					    }else{
					    	furl = option.url?option.url + url + '/' + (ele.split('.')[0]):'';
					    }
						furl = furl.replace(/\/\//g, '/');
						furl = furl.replace(/\/\//g, '/');
						let _module = require(t);
						let childOption = {
							name: '',
							url: furl,
							parent: me,
							dirname: t,
							_package: null,
							config: null
						};
						_use(furl, _module, childOption);
				    }     
				});
			}
		}else{
			//加载子模块
			let config = {};
			let _package = {};
			let name = '';
			url = option.url?option.url + url : url;
			//加载发布包
			if(fs.existsSync(`${modulePath}/package.json`)){
				_package = require(`${modulePath}/package.json`);
				if(fs.existsSync(`${modulePath}/config.json`)){
					config = require(`${modulePath}/config.json`);
				}
				module = require(`${modulePath}/index.js`);
				// module = require(`${modulePath}`);
			}else{
				module = require(modulePath);
			}
			url = url.replace(/\/\//g, '/');
			url = url.replace(/\/\//g, '/');
			let childOption = {
				namespace: _package.name || option.namespace,
				name: _package.name || '',
				url: url,
				parent: me,
				dirname: modulePath,
				_package,
				config
			};
			_use(url, module, childOption);
		}
		//加载模块
		function _use(url, module, childOption){
			//console.log(childOption);
			url = url.replace(/\/\//g, '/');
			url = url.replace(/\/\//g, '/');
			let children = new atweb(childOption);
			let mname = childOption._package && childOption._package.name?childOption._package.name:url;
			mname = mname || childOption.dirname;
			//追加模块链
			global.ATWEB.mmap[mname] = {
				namespace: childOption.namespace,
				name: mname,
				modulePath: childOption.dirname,
				pk: childOption._package,
				url: url,
				app: children,
				config: childOption.config
			};
			//反向执行模块代码
			module(children);
		};
	};
	//插入新方法
	me.addMethod = (name, fn) => {
		atweb.prototype[name] = fn;
	};
	//事件中心
	me.EC = {
		"on": (event, fn) => {
			global.HAPI.events.on(event, fn);
		},		
		"emit": (event, data) => {
			return global.HAPI.events.emit(event, data);
		},
		"add": event => {

		}
	};
	//运行时插件
	me.on = function(event, fn){
		if(event == 'request'){
			global.HAPI.ext('onRequest', function(request, h){
				fn(request,h);
				return h.continue;
			});
		}
		if(event == 'response'){
			global.HAPI.ext('onPreResponse', (request, h) => {
			    const response = request.response;
			    if (response.isBoom &&
			        response.output.statusCode === 404) {
			        return 404;
			    }
			    return h.continue;
			});
		}
	};
	//web
	me.web = webpath => {
		let path = Path.join(`${option.dirname}${webpath.replace('.', '')}` , '');
		this.tpl = (tpath) => {
			return `${path}${tpath}`;
		};
	};
	//静态目录
	me.static = function(url, dir){
		let path = `${option.dirname}.${url}`;
		if(dir){
			path = dir.charAt(0) == '/'?dir:`${option.dirname}${dir.replace('.', '')}`;
		}
		global.HAPI.route({
		    method: 'GET',
		    path: `${url}/{param*}`,
	        config: {
	        	//解析400错误
				state: {
					parse: false,
					failAction: 'ignore'
				},
			    handler: {
			        directory: {
			            path: path,
			            listing: true
			        }
			    }
		    }
		});
	};
	//下载目录
	me.download = function(url, dir){
		dir = dir || `.${url}`;
		global.HAPI.route({
		    method: 'GET',
		    path: `${url}/{param*}`,
	        config: {
	        	//解析400错误
				state: {
					parse: false,
					failAction: 'ignore'
				},
			    handler: {
			    	file: {
						confine: false,
						mode: 'attachment'
			    	},
			        directory: {
			            path: `${option.dirname}${dir.replace('.', '')}`,
			            listing: true
			        }
			    }
		    }
		});
	};
	//模块验证
	me.auth = {
		basic: function(userList){
    		me.auth.authBasic = true;
			let validate = function(request, username, password){
				let result = { credentials: {name: null}, isValid: false };
				userList.forEach(uitem => {
					uitem = uitem.split(':');
				    if (username == uitem[0] && password == uitem[1]){
				        result = { credentials: {name:uitem[0]}, isValid: true };
				    }
				});
				return result;
			};
    		global.HAPI.auth.strategy(me.auth.authName, 'basic', { validate });
    		return me.auth;
		},
		login: function(loginUrl){
    		me.auth.authLogin = true;
    		me.auth.loginUrl = loginUrl;
			const scheme = function (server, options) {
			    return {
			        authenticate: function (request, h) {
			            const authorization = request.headers.authorization;
			            const logined = request.session.logined;
			            if (!logined) {
			            	// console.log('unjohn');
			                //throw Boom.unauthorized(null, 'Custom');
			            	// return h.authenticated({ credentials: { user: 'unjohn' } });
			            	return h.redirect(me.auth.loginUrl);
			            }
			            return h.authenticated({ credentials: { user: 'john' } });
			        }
			    };
			};

			global.HAPI.auth.scheme('login', scheme);
			global.HAPI.auth.strategy(me.auth.authName, 'login');
			return me.auth;
		},
		userInfo: null,
		loginUrl: '',
		unless: function(list){
			me.auth._unless = list;
		},		
		less: function(list){
			me.auth._less = list;
		},
		_unless: [],
		_less: [],
		authName: `auth-${Date.now()}`,
		authBasic: false,
		authLogin: false
	};
	//路由方法
	["get","post","put","update","delete","*","form"].forEach(function(method){
		method = method == 'form'?'get,post':method;
		me[method] = (_url, fn, config={}) => {
			url = me.option.url + _url;
			url = url.replace(/\/\//g, '/');
			url = url.replace(/\/\//g, '/');
			url = (url == '/' || url.charAt(url.length-1)!='/')?url:url.substring(0, url.length-1);
			//记录路由信息
			global.ATWEB.rmap.push({
				path: url,
				method: method,
				handler: fn,
				config: config,
				modulePath: option.dirname,
				module: me,
				CONF: option.parent.option.config
			});
		};
	});
	me.before = function(fn){
		me._before = async function(request, h) {
			let result = await fn(request, h);
			return (result || false);
		}
	};
	//代理
	me.proxy = async function(_url, vo, config={}){
		url = option.url + _url;
		url = url.replace(/\/\//g, '/');
		url = url.replace(/\/\//g, '/');
		url = (url == '/' || url.charAt(url.length-1)!='/')?url:url.substring(0, url.length-1);
		config.payload = {
			parse: false
		};
		//记录路由信息
		global.ATWEB.rmap.push({
			path: url,
			method: '*',
			handler: function (request, h){
			    h._proxy({
			    	uri: typeof(vo) == 'string'?vo:vo.url,
			    	includeQuery: true
			    });
			},
			config: config,
			modulePath: option.dirname,
			module: me,
			CONF: option.parent.option.config
		});
    };
};

module.exports = atweb;