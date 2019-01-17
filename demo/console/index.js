module.exports = app => {
	app.get('/', async (req ,h) => {
		let list = await app.service.app.list('atweb',app);
		h.tpl('/tpl/console/index.tpl', {list});
	});
	app.post('/nginx/domain', (req, h) => {
		let vo = req.post;
		let result = app.service.nginx.domain(JSON.parse(vo.config));
		app.service.app.config.update(JSON.parse(vo.config));
		h.json(result);
	});
}