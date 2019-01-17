module.exports = app => {
	app.get('/', (r, h) => {
		h.text('cat');
	});
	app.get('/editor', (r, h) => {
		h.text('editor');
	});
}