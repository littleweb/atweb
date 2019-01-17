const fs = require('fs');
module.exports = async (network,app) => {
	let result = [];
	let list = await app.service.docker('/containers/json');
	return new Promise((res ,rej) => {
		list = JSON.parse(list);
		list.forEach((item, index) => {
			if(item.HostConfig.NetworkMode == network){
				result.push({
					name: item.Names[0].replace('/', ''),
					status: item.State,
					ip: item.NetworkSettings.Networks[network].IPAddress,
					appPath: (() => {
						let path;
						item.Mounts.forEach(sitem => {
							if(sitem.Destination == '/atweb/app'){
								path = sitem.Source;
							}
						});
						return path;
					})()
				});
			}
		});
		result.forEach(ritem => {
			if(ritem.appPath){
				ritem.config = require(`/hostroot${ritem.appPath}/config.json`);
			}
			if(fs.existsSync(`/data/yml/config/${ritem.name}.json`)){
				ritem.config = require(`/data/yml/config/${ritem.name}.json`);
			}
		});
		res(result);
	});
}