module.exports = app => {
	app.before((req,h) => {
		req.home = 'haha';
		// return 404;
	});
	// app.on('request', (r, h) => {
	// 	r.page = 'home';
	// });
	// app.auth.basic(['user:1234']).unless(['/data', '/']);
	app.get('/', (r,h) => {
		h.text(r.home);
	});
	app.get('/data', (r,h) => {
		h.json(r.data);
	});
	app.get('/jump', (r,h) => {
		h.jump('http://www.baidu.com');
	});
	app.use('/h1', './help');
	app.use('/product','./product');
	app.get('/sub', (r,h) => {
		h.text(r.home);
		// h.text('sub');
	});
}