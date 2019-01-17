module.exports = app => {
	let auth = global.CONF.model && global.CONF.model.es && global.CONF.model.es.auth?global.CONF.model.es.auth:'';
	if(auth){
		app.auth.basic([auth]);
	}
	app.get('/', (req, h) => {
		h.json('es');
	});
	//获取文档信息
	app.get('/{docid}', async function(req, h){
	    var ps = req.params;
	    var hult = await app.s.es.doc(ps.docid);
		h.json(hult);
	},{
		cors: {
            origin: ['*'],
            additionalHeaders: ['cache-control', 'x-requested-with']
        }
	});
	app.get('/{docid}/content', async function(req, h){
	    var ps = req.params;
	    var hult = await app.s.es.doc(ps.docid);
	    hult.data = hult.data.content;
		h.json(hult);
	},{
		cors: {
            origin: ['*'],
            additionalHeaders: ['cache-control', 'x-requested-with']
        }
	});
	app.get('/{docid}/map', async function(req, h){
	    var ps = req.params;
	    var hult = await app.s.es.doc(ps.docid);
	    hult.data = hult.data.map;
		h.json(hult);
	},{
		cors: {
            origin: ['*'],
            additionalHeaders: ['cache-control', 'x-requested-with']
        }
	});
	//获取文档列表
	app.get('/{docid}/list', async function(req, h){
	    var ps = req.params;
	    var qs = req.get;
	    var hult = await app.s.es.doclist(ps.docid, null, (qs.size || 200), (qs.pn || 1), (qs.sort || 'asc'), (qs.search||''));
		h.json(hult);
	},{
		cors: {
            origin: ['*'],
            additionalHeaders: ['cache-control', 'x-requested-with']
        }
	});	
	//获取文档列表
	app.get('/{docid}/list/content', async function(req, h){
	    var ps = req.params;
	    var hult = await app.s.es.doclist(ps.docid, null, 10, 0, 'content');
		h.json(hult);
	},{
		cors: {
            origin: ['*'],
            additionalHeaders: ['cache-control', 'x-requested-with']
        }
	});
	//获取某docs字段下文档列表
	app.get('/{docid}/{widgetid}/list', async function(req, h){
		var ps = req.params;
	    var hult = await app.s.es.doclist(ps.docid,ps.widgetid);
		h.json(hult);
	},{
		cors: {
            origin: ['*'],
            additionalHeaders: ['cache-control', 'x-requested-with']
        }
	});	
	//获
	app.get('/{docid}/count', async function(req, h){
		var ps = req.params;
		let id = ps.docid;
	    var count = await app.s.es.count({id});
		h.json(count);
	},{
		cors: {
            origin: ['*'],
            additionalHeaders: ['cache-control', 'x-requested-with']
        }
	});

	//新建文档
	app.post('/', async function(req, h){
		var bs = req.post;
		var hult = await app.s.es.save(bs.doc, (bs.refresh||false));
		h.json(hult);
	},{
		cors: {
            origin: ['*'],
            additionalHeaders: ['cache-control', 'x-requested-with']
        }
	});
	//修改文档
	app.post('/update', async function(req, h){
		var bs = req.post;
		var hult = await app.s.es.update(bs.doc, bs.id);
		h.json(hult);
	},{
		cors: {
            origin: ['*'],
            additionalHeaders: ['cache-control', 'x-requested-with']
        }
	});
	//删除文档
	app.delete('/{docid}', async function(req, h){
		var ps = req.params;
		var hult = await app.s.es.remove(ps.docid);
		h.json(hult);
	},{
		cors: {
            origin: ['*'],
            additionalHeaders: ['cache-control', 'x-requested-with']
        }
	});
	app.get('/delete/{docid}', async function(req, h){
		var ps = req.params;
		var hult = await app.s.es.remove(ps.docid);
		h.json(hult);
	},{
		cors: {
            origin: ['*'],
            additionalHeaders: ['cache-control', 'x-requested-with']
        }
	});
	app.post('/query', async function(req, h){
		var bs = req.post;
		var hult = await app.s.es.query(bs.dsl, 20, 10);
		h.json(hult);
	},{
		cors: {
            origin: ['*'],
            additionalHeaders: ['cache-control', 'x-requested-with']
        }
	});
}