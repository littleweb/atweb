module.exports = app => {
	app.get('/', (r, h) => {
		h.text('a');
	});
	app.get('/aa', (r, h) => {
		h.text('a');
	});
}