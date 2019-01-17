module.exports = app => {
	app.get("/", async function(request, h){
		h.text("home");
	});
	app.proxy("/baidu", {url: 'https://www.baidu.com'});
}