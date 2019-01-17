module.exports = app => {
	app.get('/login', (req, h) => {
		req.session.userInfo = {
			name: 'name'
		};
		h.text('登录啊');
	});
}