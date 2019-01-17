module.exports = app => {
	app.get('/api', (r, h) => {
		h.text('api');
	});
	//测试：跨模块调用
	//url结构
	app.get('/user', (r, h) => {
		h.text(app.$('atweb-demo:/mismis/user').model.config);
	});
	//目录结构
	app.get('/user/dir', (r, h) => {
		h.text(app.$('atweb-demo:/mis/user').model.config);
	});
	//子模块方式
	app.get('/auth', (r, h) => {
		h.text(app.$('atweb-config:/').service.auth());
	});
	//子模块用父级方式
	app.get('/auth/config', (r, h) => {
		h.text(app.$('atweb-demo:/config').service.auth());
	});
}