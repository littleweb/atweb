module.exports = app => {
	// app.auth.basic(['a:b']).unless(['/get/*']);
	// app.auth.login('/user/login').unless(['/user/login','/']);
	app.before(async (req,h)=>{
		let res = await app.axios.get('https://www.baidu.com');
		console.log(res.data);
		req.x = 'x';
	});
	app.get('/before', (r, h) => {
		h.text(r.x);
	});
	//加载模块：自定义路由
	app.use('/', './home');
	app.use('/mismis', './mis');
	app.use('/onedoc', 'onedoc');
	//加载模块：直接加载
	app.use('/config');
	//加载模块：目录加载
	app.use('/anyx', './any/*');
	app.use('/transgod', './server/*');
	//直接写路由
	app.get('/get', (r, h) => {
		r.session.logined = true;
		h.text('get方法');
	});
    app.get("/redis/list",async (req, h) => {
        var list = [];
        let result = await new Promise((res,rej) => {
            app.redis.client.keys('*', async function (err, keys) {
                if (err) return console.log(err);
                for(var i = 0, len = keys.length; i < len; i++){
                    var _data = await app.redis.get(keys[i]);
                    var _new = {};
                    _new[keys[i]] = _data;
                    list.push(_new);
                }
                res(list);
            });
        });
        h.json(result);
    });
    app.get("/redis/clear",async (req, h) => {
        var list = [];
        let result = await new Promise((res,rej) => {
            app.redis.client.flushdb(() => {
                res(200);
            });
        });
        h.text(result);
    });
	app.get('/get/xx', (r, h) => {
		r.session.demo = 'demo';
		h.text(r.session.demo);
	});

	//测试： 登录
	app.use('/user', './login');

	//测试：跨模块调用
	app.use('/mixin');
	//测试：模板渲染
	app.use('/tpl', './tpl');
	//测试：读取配置
	app.get('/conf', (r, h) => {
		//h.json(app.$('atweb-demo'));
		//h.json(app.CONF);
		h.json(app);
	});
	app.get('/rmap', (r, h) => {
		console.log(global.ATWEB.rmap);
		h.json(global.ATWEB.rmap);
	});
	app.get('/redis', async (r, h) => {
		let uv = await app.redis.get('uv');
		uv = uv || 0;
		uv++;
		app.redis.set('uv', uv);
		h.text(uv);
	});
	app.get('/session', async (r, h) => {
		let uv = r.session.uv;
		uv = uv || 0;
		uv++;
		r.session.uv = uv;
		h.text(uv);
	});
	//测试：mongo数据库使用
	app.use('/mongo', './mongo');

	//测试：method
	app.use('/method', './method');

	//测试：静态目录
	app.static('/static');

	app.use('/__console', './console');

	//无路由插件引用
	//app.use('/$', './插件目录');
}