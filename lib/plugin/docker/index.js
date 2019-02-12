const fs = require('fs');
const YAML = require('yamljs');
const { spawn } = require('child_process');
module.exports = app => {
	for(let key in global.ATWEB.mmap){
		let mitem = global.ATWEB.mmap[key];
		let modulePath = mitem.modulePath;
		let config = mitem.config;
		let pk = mitem.pk;
		if(fs.existsSync(`${modulePath}/docker-compose.yml`)){
			if(fs.existsSync(`${modulePath}/package.json`)){
				pk = require(`${modulePath}/package.json`);
			}
			config = config || pk || {};
			let APP = config.name || modulePath.replace(/\//g,'_');
			let PORT = config.dockerPort || '';
			let DATAPATH = config.datapath || process.env.datapath || '$PWD/_data';
			let yml = fs.readFileSync(`${modulePath}/docker-compose.yml`, 'utf8');
			yml = yml.replace(/APP/g, APP);
			yml = yml.replace(/PORT/g, PORT);
			yml = yml.replace(/DATAPATH/g, DATAPATH);
			yml = yml.replace(/\$PWD/g, modulePath.replace('/atweb/app', process.env.apppath));
			yml = yml.replace(/NET/g, 'atweb');
			if(!fs.existsSync(`/data/yml/`)){
				fs.mkdirSync(`/data/yml/`);
			}
			fs.writeFileSync(`/data/yml/${APP}.docker-compose.yml`, yml, 'utf8');
			//JSON化YML
			let json = YAML.parse(yml);
			let cs = [];
			for(let ckey in json.services){
				cs.push(json.services[ckey]);
			}
			//抽取容器信息
			global.ATWEB.docker.yml.push({
				yml: `/data/yml/${APP}.docker-compose.yml`,
				json: json,
				cs: cs
			});
			//检测是否需要为docker镜像建立别名
			for(let key in cs){
				if(cs[key].labels && cs[key].labels.alias){
					let alias = cs[key].labels.alias;
					let cname = cs[key].container_name;
					fs.writeFileSync(`/usr/bin/${alias}`, `docker exec -i ${cname} ${alias} $*`, 'utf8');
					fs.chmodSync(`/usr/bin/${alias}`, '777');
				}
			}
			(function(){
				const compose = spawn('docker-compose', ['-f', `/data/yml/${APP}.docker-compose.yml`, 'up', '-d']);
				compose.stdout.on('data', (data) => {
					console.log(`docker日志: ${data}`);
				});
				compose.stderr.on('data', (data) => {
					console.log(`docker日志: ${data}`);
				});
				compose.on('close', (code) => {
					app.EC.emit('docker:done', yml);
					console.log(`docker启动成功：${APP}`);
				});
				let cmdUp = `docker-compose -f /atweb/yml/${APP}.docker-compose.yml up -d`;
				return new Promise((res ,rej) => {
					require('child_process').exec(cmdUp,{},function(err, result){	
					app.EC.emit('docker:done', yml);
						res(err);
					});
				});
				dockerCompose.up({ cwd: `/atweb/yml/${APP}.docker-compose.yml`, log: true })
					.then(
					() => { console.log('done')}, 
					err => { console.log('something went wrong:', err.message)}
				);
			})();
		}
	}
	app.get('/', async (req, h) => {
		let list = await app.service.cmd('docker ps --format "{{.Names}}"');
		list = list.split('\n');
		let result = [];
		for(let i = 0;i<list.length;i++){
			let item = list[i];
			if(item){
				let ip = await app.service.cmd(`docker inspect --format="{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}" ${item}`);
				result.push({
					name: item,
					ip: ip.replace(/\n/g,'')
				})	
			}
		}
		h.json({result});
	});
}