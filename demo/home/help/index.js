module.exports = app => {
	app.get('/', (r,h) => {
		h.text('h1');
	});
	app.get('/sub', (r,h) => {
		h.text('h1/sub');
	});
}