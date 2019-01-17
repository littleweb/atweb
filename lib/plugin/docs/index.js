const fs = require('fs');
const Path = require('path');
//挂载文档
module.exports = app => {
	//按模块搜索
	for(let key in global.ATWEB.mmap){
		let mitem = global.ATWEB.mmap[key];
		let dpath = `${mitem.modulePath}/docs/`;
		let docs = {};
		if(fs.existsSync(dpath)){
			let files = fs.readdirSync(dpath);
			if(files.length > 0){
				files.forEach(function(file){
					file = `${dpath}${file}`;
					if(file.substr(file.length-3,3) == ".js"){
						let result = [];
						//转换格式
						if(fs.existsSync(file)){
							result = require(file);
							if(typeof(result) == 'object'){
								result = [result];
							}
							result.forEach(doc => {
								let _result = {};
								_result.description = doc.name;
								_result.tags = doc.tag || [];
								if(doc.note){
									_result.notes = doc.note;
								}
								_result.validate = {};
								if(doc.post){
									_result.validate.payload = doc.post;
								}		
								if(doc.get){
									_result.validate.query = doc.get;
								}		
								if(doc.path){
									_result.validate.params = doc.path;
								}
								docs[doc.url] = _result;
							});
						}
					}
				});
			}
		}
		mitem.app.docs = docs || {};
	}
	//按路由挂载
	global.ATWEB.rmap.forEach((ritem,index) => {
		// 挂载doc
		let url = ritem.path.replace(ritem.module.option.url, '');
		url = url || '/';
		if(ritem.module.docs){
			let docInfo = ritem.module.docs[url];
	       	for(_key in docInfo){
	       		if(_key == "tags"){
	       			docInfo.tags.forEach(titem => {
	       				global.ATWEB.rmap[index].config.tags = global.ATWEB.rmap[index].config.tags || [];
	       				global.ATWEB.rmap[index].config.tags.push(titem);
	       			});
	       		}else{
	        		global.ATWEB.rmap[index].config[_key] = docInfo[_key];
	       		}
	        }
        }
	});
}