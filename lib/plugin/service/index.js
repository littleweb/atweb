const fs = require('fs');
module.exports = app => {
	for(let key in global.ATWEB.mmap){
		let mitem = global.ATWEB.mmap[key];
		let mpath = `${mitem.modulePath}/service/`;
		let service = {};
		if(fs.existsSync(mpath)){
			let tree = require("dir2json")(mpath, false);
			//递归路径
			let fn = function(parent,path){
				if(path.children){
					parent[path.label] = parent[path.label] || {};
					path.children.forEach(function(item){
						if(item.type == 'file'){
							parent[path.label][item.label.split('.')[0]] = require(item.path);
						}
						if(item.children){
							fn(parent[path.label],item);
						}
					});
				}
			}
			fn(service,tree);
		}
		mitem.app.s = mitem.app.service = service.service || {};
	}
}