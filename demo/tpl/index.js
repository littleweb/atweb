module.exports = app => {
	app.get('/view', (r, h) => {
		h.tpl('/tpl/demo.tpl', {
			title: 'title'
		});
	});
	app.get('/web', (r, h) => {
		h.json(app);
	});
}