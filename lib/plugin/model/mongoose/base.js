var BaseModel = function(baseModel){
	function Base(vo){
		this.vo = vo;
		this.model = baseModel;
	}
	//保存新记录
	Base.save = function(vo){
		var me = this;
		return new Promise(function(resolve, reject){
			var newDoc = new baseModel(vo);
			newDoc.save(function (err, doc){
				err && reject(err);
				resolve(doc);
			});
		});
	};
    Base.upsert = function(query,doc){
        return new Promise(function(resolve, reject){
            baseModel.where(query).count(function(err, data){
                if(data > 0){
                    baseModel.find(query,{}, function (err, _doc){
                        _doc = _doc[0];
                        for(var key in doc){
                            if(key != '__v'){
                                _doc[key] = doc[key];
                            }
                        }
                        _doc.update_time = Date.now();
                        _doc.save(function(err){
                            resolve(_doc);
                        });
                    });
                }else{
                    var newDoc = new _Model(doc);
                    newDoc.save(function (err, doc){
                        resolve(doc);
                    });
                }
            });
        });
    };
	//查询
    Base.find = function(a,b){
        return new Promise(function(resolve, reject){
            baseModel.find(a,b,function(err, data){
                err && reject(err);
                resolve(data);
            });
        });
    };
	//更新
	Base.update = function(doc){
		return new Promise(function(resolve, reject){
			baseModel.findById(doc._id, function (err, _doc){
				for(var key in doc){
					_doc[key] = doc[key];
				}
				_doc.update_time && (_doc.update_time = Date.now());
				_doc.save(function(err){
					resolve(_doc);
				});
			});
		});
	};
	//字段更新
    Base.updateSglfield = function(doc1,doc2){
        return new Promise(function(resolve, reject){
            //遍历筛选条件
            var term = {},aim = {};
            for(var key in doc1){
                term[key]=doc1[key];
            };
            //遍历目标
            for(var key in doc2){
                aim[key]=doc2[key];
            };
            baseModel.update(term,aim).exec(function(err, data){
                err && reject(err);
                resolve(data);
            });
        });
    };
	//按id获取数据
	Base.getById = function(id){
		return new Promise(function(resolve, reject){
			baseModel.findOne({"_id": id}, function (err, doc) {
				err && reject(err);
				resolve(doc);
			});
		});
	};
	//获取列表数据
	Base.list = function(vo){
        var vo = vo || {};
        var query = vo.query || {},
            sort = vo.sort || "",
            size = vo.size || 10,
            pn = vo.pn || 0;
        return new Promise(function(resolve, reject){
            baseModel.find(query).sort(sort).limit(Number(size)).skip(Number(size)*Number(pn)).exec(function(err, data){
				err && reject(err);
				resolve(data);
			});
		});
	};	
	//获取数量
	Base.total = function(query){
		return new Promise(function(resolve, reject){
			baseModel.where(query).count(function(err, data){
				err && reject(err);
				resolve(data);
			});
		});
	};
	//分页
    Base.pageDataDesc = function(query,pageindex,pagesize) {
        pagesize=Number(pagesize)||10;
        return new Promise(function(resolve, reject){
            baseModel.find({},{}).sort(query).skip((pageindex-1)*pagesize).limit(pagesize).exec(function(err, data){
                err && reject(err);
                resolve(data);
            });
        });
    };
	//删除
	Base.delete = function(_id){
        return new Promise(function(resolve, reject){
			baseModel.remove({_id: _id}, function(err, doc){
			    if (err) {
			    	res(err);
			    }
			    res(doc);
			});
		});
	};
	return Base;
}
module.exports = BaseModel;