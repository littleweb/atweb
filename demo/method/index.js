module.exports = app => {
	app.get('/get', (req, h) => {
		h.text('get');
	});
	app.post('/post', (req, h) => {
		h.text('post');
	});
	app.use('/baidu', 'https://www.baidu.com');
	app.proxy('/proxy', 'https://www.baidu.com');
}