const fs = require('fs');
const Path = require('path');
const mongoose = require('./mongoose');
module.exports = app => {
	{
		let model = {};
		for(let key in global.ATWEB.mmap){
			let mitem = global.ATWEB.mmap[key];
			let mpath = `${mitem.modulePath}/model/`;
			let config = mitem.config || {};
			let cmodel = config.model || {};
			if(fs.existsSync(mpath)){
				let files = fs.readdirSync(mpath);
				if(files.length > 0){
					files.forEach(function(file){
						let _file = file.split(".");
						_file.reverse();
						let _map = require(mpath + file);
						//json配置文件
						model[file.split(".")[0]] = _map;
					});
				}
			}
			mitem.app.m = mitem.app.model = model;
		}
	}
	if(global.CONF && global.CONF.model && global.CONF.model.mongo){
		for(let key in global.ATWEB.mmap){
			let mitem = global.ATWEB.mmap[key];
			let model = mitem.app.m || {};
			let mpath = `${mitem.modulePath}/model/`;
			let config = mitem.config || {};
			let cmodel = config.model || {};
			let mongo = cmodel.mongo || {};
			let gMongo = global.CONF && global.CONF.model && global.CONF.model.mongo?global.CONF.model.mongo:{};
			let dbhost = mongo.dbhost || gMongo.dbhost || 'one-mongo';
			let dbname = mongo.dbname || gMongo.dbname || "one";
			let mkey = dbhost + dbname;
			mongoose.init(dbhost, dbname, mitem).then(mongo => {
				mitem.mongo = mongo;
				mitem.mongodb = mkey;
				if(fs.existsSync(mpath)){
					let files = fs.readdirSync(mpath);
					if(files.length > 0){
						files.forEach(function(file){
							let _map = require(mpath + file);
							if(Path.extname(file) == '.js'){
								model[Path.basename(file,'.js')] = mongoose.exmodel(mitem.mongo, Path.basename(file,'.js'), _map);
							}
							model.mongo = mitem.mongodb;
						});
					}
				}
				mitem.app.m = mitem.app.model = model;
			});
		}
	}
}