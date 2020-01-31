const axios = require('axios');
module.exports = app => {
	if(global.CONF && global.CONF.model && global.CONF.model.onedoc){
		let odHost = global.CONF.model.onedoc.host || 'http://localhost/api';
		let onedoc = {
			//存储文档
			saveDoc: function(vo){
				let doc = {
					"meta": {
						"icon": vo.icon || "/icon/tag.png",
						"name": vo.name,
						"file_type_id": vo.fid,
						"parent": {
							"doc_id": vo.pid
						}
					},
					"content": vo.data
				};
				if(vo.id){
					doc.id = vo.id;
				}
				if(vo.time){
					doc.meta._status = doc.meta._status || {};
					doc.meta._status.create_time = vo.time;
				}
				return new Promise((res, rej) => {
				    axios.post(`${odHost}/doc`, {
				        doc: JSON.stringify(doc)
				    }).then(data => {
				    	if(data.data.data){
				    		res(data.data.data)
				    	}else{
				    		res('');
				    	}
				    }).catch(function (error) {
					    // handle error
					    console.log(error);
					});
				});
			},	
			save: function(doc){
				return new Promise((res, rej) => {
				    axios.post(`${odHost}/doc`, {
				        doc: JSON.stringify(doc)
				    }).then(data => {
				    	if(data.data.data){
				    		res(data.data.data)
				    	}else{
				    		res('');
				    	}
				    }).catch(function (error) {
					    // handle error
					    console.log(error);
					  });
				});
			},	
			update: function(doc,id){
				return new Promise((res, rej) => {
				    axios.post(`${odHost}/doc/update`, {
				        doc: JSON.stringify(doc),
				        id: id
				    }).then((data) => {
				    	if(data.data.data){
				    		res(data.data.data)
				    	}else{
				    		res('');
				    	}
				    }).catch(function (error) {
					    // handle error
					    console.log(error);
					});
				});
			},
			//删除文档
			removeDoc: function(id){
				return new Promise((res, rej) => {
				    axios.get(`${odHost}/doc/delete/${id}`);
			    }).then(data => {
			    	if(data.data.data){
			    		res(data.data.data)
			    	}else{
			    		res('');
			    	}
			    });
			},
			doc: function(id){
				return new Promise((res, rej) => {
				    axios.get(`${odHost}/doc/${id}?t=${Date.now()}`).then(data => {
				    	if(data.data.data){
				    		res(data.data.data)
				    	}else{
				    		res('');
				    	}
				    });
			    });
			},
			content: function(id,key){
				return new Promise((res, rej) => {
				    axios.get(`${odHost}/doc/${id}/content?t=${Date.now()}`).then(data => {
				    	if(data.data.data){
				    		if(key){
				    			res(data.data.data[key]);
				    		}else{
				    			res(data.data.data);
				    		}
				    	}else{
				    		res('');
				    	}
				    });
			    });
			},	
			count: function(id){
				return new Promise((res, rej) => {
				    axios.get(`${odHost}/doc/${id}/count?t=${Date.now()}`).then(data => {
				    	if(data.data.data){
				    		res(data.data.data)
				    	}else{
				    		res(0);
				    	}
				    });
			    });
			},
			//获取doclist信息
			doclist: function(id){
				return new Promise((res, rej) => {
				    axios.get(`${odHost}/doc/${id}/list?t=${Date.now()}`).then(data => {
				    	if(data.data.data){
				    		res(data.data.data)
				    	}else{
				    		res('');
				    	}
				    });
			    });
			},
			//查询
			query: function(dsl){
				return new Promise((res, rej) => {
				    axios.post(`${odHost}/doc/query?t=${Date.now()}`,{
				    	dsl: JSON.stringify(dsl)
				    }).then(data => {
				    	if(data.data.data){
				    		res(data.data.data)
				    	}else{
				    		res('');
				    	}
				    });
			    });
			},
			//查询删除
			deleteByQuery: function(dsl){
				return new Promise((res, rej) => {
				    axios.post(`${odHost}/doc/delete?t=${Date.now()}`,{
				    	dsl: JSON.stringify(dsl)
				    }).then(data => {
				    	res(data.data);
				    });
			    });
			},
			//复杂查询
			qs: {
				must: function(vo,size,pn){
					let musts = [];
					for(let key in vo){
						musts.push(
							{match: {[key]: vo[key]}}
						);
					}
					let dsl = {
			            "size": size || 10,
			            // "from": pn || 0,
			            "query": {
		                	"bool": {
				                "must": musts
				            }
			            },
				        "sort": {"doc.meta._status.update_time": {"order": "desc"}}
		            };
					return new Promise((res, rej) => {
					    axios.post(`${odHost}/doc/query`,{
					    	dsl: JSON.stringify(dsl)
					    }).then(data => {
					    	if(data.data.data){
					    		res(data.data.data)
					    	}else{
					    		res('');
					    	}
					    });
				    });
				},		
				mustData: function(vo,size,pn,dataapi){
					let musts = [];
					for(let key in vo){
						musts.push(
							{match: {[key]: vo[key]}}
						);
					}
					let dsl = {
			            "size": size || 10,
			            // "from": pn || 0,
			            "query": {
		                	"bool": {
				                "must": musts
				            }
			            },
				        "sort": {"doc.meta._status.update_time": {"order": "desc"}}
		            };
					return new Promise((res, rej) => {
					    axios.post(`${dataapi}/doc/query`,{
					    	dsl: JSON.stringify(dsl)
					    }).then(data => {
					    	if(data.data.data){
					    		res(data.data.data)
					    	}else{
					    		res('');
					    	}
					    });
				    });
				},		
				mustNot: function(vo,size,pn){
					let musts = [];
					for(let key in vo){
						musts.push(
							{match: {[key]: vo[key]}}
						);
					}
					let dsl = {
			            "size": size || 10,
			            // "from": pn || 0,
			            "query": {
		                	"bool": {
				                "must_not": musts
				            }
			            },
				        "sort": {"doc.meta._status.update_time": {"order": "desc"}}
		            };
					return new Promise((res, rej) => {
					    axios.post(`${odHost}/doc/query`,{
					    	dsl: JSON.stringify(dsl)
					    }).then(data => {
					    	if(data.data.data){
					    		res(data.data.data)
					    	}else{
					    		res('');
					    	}
					    });
				    });
				},
				rnd: function(vo,size,pn){
					// console.log(odHost);
					let musts = [];
					for(let key in vo){
						musts.push(
							{match: {[key]: vo[key]}}
						);
					}
					let dsl = {
			            "size": size || 10,
			            // "from": pn || 0,
			            "query": {
	                    	"bool": {
				                "must": musts
				            }
			            },
				        // "sort": {"doc.meta._status.update_time": {"order": "asc"}},
				        "sort": {
							"_script": {
								"script": "Math.random()",//随机排序
								"type": "number",
								"order": "asc"
							}
						}
		            };
					return new Promise((res, rej) => {
					    axios.post(`${odHost}/doc/query`,{
					    	dsl: JSON.stringify(dsl)
					    }).then(data => {
					    	if(data.data.data){
					    		res(data.data.data)
					    	}else{
					    		res('');
					    	}
					    });
				    });
				}
			}
		};	
		app.addMethod("onedoc", onedoc);
	}
}