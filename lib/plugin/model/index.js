const fs = require('fs');
const mongoose = require('./mongoose');
module.exports = async (app) => {
	if(global.CONF && global.CONF.model && global.CONF.model.mongo){
		app.addMethod('mongo', {});
		// app.EC.on('docker:done', async (yml) => {
			// if(yml.indexOf('atweb-mongo') > -1){
				for(let key in global.ATWEB.mmap){
					let mitem = global.ATWEB.mmap[key];
					let mpath = `${mitem.modulePath}/model/`;
					let config = mitem.config || {};
					let cmodel = config.model || {};
					let mongo = cmodel.mongo || {};
					let gMongo = global.CONF && global.CONF.model && global.CONF.model.mongo?global.CONF.model.mongo:{};
					let dbhost = mongo.dbhost || gMongo.dbhost || 'atweb-mongo';
					let dbname = mongo.dbname || gMongo.dbname || "atweb";
					let mkey = dbhost + dbname;
					mitem.mongo = await mongoose.init(dbhost, dbname, mitem);
					mitem.mongodb = mkey;
					global.HAPI.events.emit('mongo:done', mitem);
				}
			// }
		// });
		app.EC.on('mongo:done', (mitem) => {
			let mpath = `${mitem.modulePath}/model/`;
			console.log(mpath);
			let model = {};
			if(fs.existsSync(mpath)){
				let files = fs.readdirSync(mpath);
				console.log(files);
				if(files.length > 0){
					files.forEach(function(file){
						let _file = file.split(".");
						_file.reverse();
						let _map = require(mpath + file);
						if(_file[0] == 'js'){
							model[file.split(".")[0]] = mongoose.exmodel(mitem.mongo, file.split(".")[0], _map);
						}else{
							//json配置文件
							model[file.split(".")[0]] = _map;
						}
						model.mongo = mitem.mongodb;
					});
				}
			}
			mitem.app.m = mitem.app.model = model || {};
		});
	}
}