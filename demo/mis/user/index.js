module.exports = app => {
	app.get('/', (r, h) => {
		h.text(app.service.uuid());
	});
	app.get('/config', (r, h) => {
		h.text(app.model.config);
	});
}