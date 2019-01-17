module.exports = app => {
	app.get('/', (r, h) => {
		h.text('mis');
	});
	app.use('/user', './user');
	app.name = 'mis';
}