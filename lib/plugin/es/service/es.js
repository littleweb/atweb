var moment = require('moment');
var elasticsearch = require('elasticsearch');
var client = new elasticsearch.Client({
	host: global.CONF.es,
	//log: 'trace'
});
const ESINDEX = {
	index: 'oncer',
	type: 'doc'
};
var es = {
	//获取文档信息
	"doc": function(id){
		return new Promise(function(res,rej){
			client.exists({
				index: ESINDEX.index,
				type: ESINDEX.type,
				id: id
			}, function (error, exists) {
				if (exists === true) {
					client.search({
						index: ESINDEX.index,
						type: ESINDEX.type,
						q: `_id: ${id}`
					}).then(function (resp){
						var hits = resp.hits.hits;
						var data = hits[0]?hits[0]._source:{};
						data.doc.id = id;
						res({
							status: 200,
							msg: '成功',
							data: data.doc
						});
					}, function (err) {
						if(err){
							res({
								status: 400,
								msg: '没有数据'
							});
						}
					});
				} else {
					res({
						status: 400,
						msg: '没有数据'
					});
				}
			});

		});
	},
	//获取文档列表
	"doclist": function(docid,widget_id,size,pn,sort,search){
		return new Promise(function(res,rej){
			var body = {
		       "size": size,
		       "from" : (pn-1)*size, "size" : size,
		       "query" : {
		            "bool": {
		                "must": [
		                    {"match": {"doc.meta._status.work_status": 0}}
		                ]
		            }
		        },
		        "sort": {"doc.meta._status.create_time": {"order": sort}}
			};
			if(docid.indexOf('fti:') > -1){
				body.query.bool.must.push({
					"match": { "doc.meta.file_type_id.keyword": docid.split('fti:')[1]}
				});				
			}else{
				body.query.bool.must.push({
					"match": {"doc.meta.parent.doc_id.keyword": docid}
				});					
			}
			if(widget_id){
				body.query.bool.must.push({
					"match": { "doc.meta.parent.widget_id.keyword": widget_id}
				});
			}			
			if(search){
				let s = search.split(':');
				body.query.bool.must.push({
					"match": {[s[0]]: s[1]}
				});
			}
			// console.log(JSON.stringify(body,null,4));
			client.search({
				index: ESINDEX.index,
				type: ESINDEX.type,
				body: body
			}).then(function (resp){
				var hits = resp.hits.hits;
				var data = hits.length>0?hits:[];
				var list = [];
				if(data.length > 0){
					data.forEach(function(item){
						item._source.doc.map = item._source.doc.map || [];
						item._source.doc.id = item._id;
						list.push(item._source.doc);
					});
				}
				let count = resp.hits.total;
				res({
					status: 200,
					msg: '成功',
					data: {list,count}
				});
				res({
					status: 200,
					msg: '成功',
					data: list,
				});
			}, function (err) {
				if(err){
					res({
						status: 400,
						msg: '没有数据'
					});
				}
			});
		});
	},
	//获取文档列表
	"query": function(dsl,size,pn){
		dsl = JSON.parse(dsl);
		return new Promise(function(res,rej){
			client.search({
				index: ESINDEX.index,
				type: ESINDEX.type,
				body: dsl
			}).then(function (resp){
				var hits = resp.hits.hits;
				var data = hits.length>0?hits:[];
				var list = [];
				if(data.length > 0){
					data.forEach(function(item){
						item._source.doc.map = item._source.doc.map || [];
						item._source.doc.id = item._id;
						list.push(item._source.doc);
					});
				}
				let aggs;
				if(resp.aggregations){
					aggs = resp.aggregations;
				}
				let count = resp.hits.total;
				res({
					status: 200,
					msg: '成功',
					data: {list,aggs,count}
				});
			}, function (err) {
				// console.log(err);
				if(err){
					res({
						status: 400,
						msg: '没有数据'
					});
				}
			});
		});
	},
	//新建文档
	"save": function(doc, refresh){
		var doc = typeof(doc) == 'string'?JSON.parse(doc):doc;
		return new Promise(function(res,rej){
			es._exitsIndex(function(){
				doc.meta._status = doc.meta._status || {};
				if(!doc.meta._status.create_time){
					doc.meta._status.create_time = moment().format();
				}
				doc.meta._status.update_time = moment().format();
				doc.meta._status.work_status = 0;
				doc.meta.map_type = doc.meta.map_type || 'map';
				if(doc.meta.file_type_id){
					doc.map = [];
				}
				var docs = [];
				if(doc.id){
					docs.push({
						index: {
							_index: ESINDEX.index,
							_type: ESINDEX.type,
							_id: doc.id
						} 
					});
					delete doc.id;
				}else{
					docs.push({
						index: {
							_index: ESINDEX.index,
							_type: ESINDEX.type,
						} 
					});
				}
				if(doc._map){
					delete doc._map;
				}
				docs.push({doc});
				let content = {
					body: docs
				}
				if(!content.body[0].index._id || refresh){
					content.refresh = true;
				}
				client.bulk(content, function (err,resp){
					err && rej(err);
					res({
						status: 200,
						msg: '成功',
						data: doc,
						res: resp
					});
				});
			});
		});
	},	
	"update": function(doc, id){
		doc = typeof(doc) == 'string'?JSON.parse(doc):doc;
		// console.log(doc);
		return new Promise(function(res,rej){
			client.update({
				index: ESINDEX.index,
				type: ESINDEX.type,
				id: id,
				body: {
					doc: doc
				}
			}).then(result => {
				res({
					status: 200,
					msg: '更新成功',
					data: result
				});
			});
		});
	},
	"remove": function(_id){
		return new Promise(function(res,rej){
			client.delete({
				index: ESINDEX.index,
				type: ESINDEX.type,
				refresh: true,
				id: _id,
			}, function(error, response){
				if(!error){
					res({
						status: 200,
						msg: '删除成功'
					});
				}
			});			
		});
	},
	//检测索引是否存在
	"count": function(query){
		let vo = {
			index: ESINDEX.index,
			type: ESINDEX.type,
			query: {
				id: query.id
			}		
		};
		return new Promise(function(res,rej){
			client.count(vo).then(result => {
				res(result.count);
			});
		});
	},
	//检测索引是否存在
	"_exitsIndex": function(cb){
		//检测索引是否存在
		client.exists({
			index: ESINDEX.index,
			type: ESINDEX.type,
			id: 'onedata'
		}, function(error, exists){
			if(!exists){
				//新建立初始化文档
				client.index({
					index: ESINDEX.index,
					type: ESINDEX.type,
					id: 'onedata',
					body: {}
				}, function(error, response){
					if(!error){
						if(cb)cb();
					}
				});
			}else{
				if(cb)cb();
			}
		});
	}
}
es._exitsIndex();

module.exports = es;