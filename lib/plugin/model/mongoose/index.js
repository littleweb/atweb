const exmodel = require('./exmodel');
const mongoose = require('mongoose');

module.exports = {
	init: (host, dbname) => {
		return new Promise((res,rej) => {
			//初始化mogoose
			let mkey = host + dbname;
			let mongo = global.ATWEB.db.mongo[mkey];
			if(!mongo){
				mongoose.Promise = global.Promise;
				let con = () => {
					mongo = mongoose.createConnection(`mongodb://${host}/${dbname}`);
					mongo.on('error', (err) => {
						// count++;
						// console.log(`重试 第${count}次`);
						//setTimeout(con, 1500);
					});
					mongo.once('open',function(){
						console.log(`mongo连接成功: mongodb://${host}/${dbname}`);
						global.ATWEB.db.mongo[mkey] = mongo;
						res(mongo);
					});
				};
				con();
			}else{
				res(mongo);
			}
		});
	},
	exmodel: exmodel
};