const fs = require('fs');
module.exports = {
	"update": (config,app) => {
		if(!fs.existsSync(`/data/yml/config`)){
			fs.mkdirSync(`/data/yml/config`);
		}
		fs.writeFileSync(`/data/yml/config/${config.name}.json`, config, 'utf-8');
		return {
			status: 200,
			msg: "更新配置成功"
		};
	},
	"read": name => {
		if(fs.existsSync(`/data/yml/config/${name}.json`)){
			return require(`/data/yml/config/${name}.json`);
		}else{
			return null;
		}
	}
}