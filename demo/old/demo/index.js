const Joi = require('joi');
module.exports = app => {
	app.get("/", async function(request,h){
		h.code(500,"2000");
	});
	app.get("/tpl", async function(request,reply){
		reply.tpl('/x');
	});
	app.post("/info", async function(request,h){
		h.json({url:request.url});
	});
	app.post("/form", async function(request,h){
		h.json(request.post);
	});
	app.get("/download", async function(request,h){
		h.download('/var/www/app/test/demo/config.json.zip', 'x.zip');
	});
}