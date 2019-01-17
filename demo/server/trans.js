module.exports = app => {
	app.get('/', (r, h) => {
		h.text('trans');
	});
}