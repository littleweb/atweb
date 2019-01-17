module.exports = app => {
	//测试
	app.get('/demo', async (r, h) => {
		h.json(app);
	});
	//用户列表
	app.get('/list', async (r, h) => {
		let userList = await app.model.User.list();
		h.json({userList});
	});
	//增加用户
	app.get('/add', async (r, h) => {
		let newUser = await app.model.User.save({
			user_name: '用户名',
			nick_name: '昵称'
		});
		let userList = await app.model.User.list();
		h.json({userList});
	});
}