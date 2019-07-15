const args = process.argv.splice(2);
const lib = require('./lib');
const config = lib.config(args[0]);

if(args[1]){
	//如果有参数1，则运行相关命令
	switch(args[1]){
		case 'log':
			lib.exec(`docker logs -f --tail=100 ${config.name}`);
			break;
		case 'restart':
			lib.exec(`docker exec -i ${config.name} pm2 restart app`);
			break;
		case 'stop':
			lib.exec(`docker-compose -f /data/yml/${config.name}.yml stop`);
			break;
		case 'bash':
			console.log(config.name);
			break;
	}
}else{
	//如果只有参数0，则启动应用
	lib.upYml(args[0]);
}