const { spawn } = require('child_process');
const fs = require('fs');
var lib = {
	//加载app
	loadApp: ars => require('atweb')(args),
	//执行shell命令
	exec: cmd => {
		cmd = cmd.split(' ');
		let _exec = spawn(cmd[0], cmd.splice(1));
		_exec.stdout.on('data', (data) => {
			console.log(`${data}`);
		});
		_exec.stderr.on('data', (data) => {
			console.log(`${data}`);
		});
	},
	//读取配置
	config: apppath => {
		//项目配置
		let config = require(`/hostroot/${apppath}/config.json`);
		let configPath = `/hostroot/${apppath}/config.json`;
		//项目本地配置
		if(fs.existsSync(`/data/${config.name}/.config.json`)){
			config = require(`/data/${config.name}/.config.json`);
			configPath = (`/data/${config.name}/.config.json`);
		}		
		//项目本地配置
		if(fs.existsSync(`/hostroot/${apppath}/.config.json`)){
			config = require(`/hostroot/${apppath}/.config.json`);
			configPath = (`/hostroot/${apppath}/.config.json`);
		}		
		//项目本地配置
		if(fs.existsSync(`/hostroot/${apppath}/_config.json`)){
			config = require(`/hostroot/${apppath}/_config.json`);
			configPath = (`/hostroot/${apppath}/_config.json`);
		}
		config.configPath = configPath;
		return config;
	},
	//启动应用
	upYml: (apppath) => {
		lib.exec(`docker network create atweb`);
		let ATWEB_DATA = '/tmp/atweb_data';
		let config = lib.config(apppath);
		let status = config.status || 'dev';
		ATWEB_DATA = config.datapath || ATWEB_DATA;
		//检测应用目录，没有则创建
		if(!fs.existsSync(`/data/yml`)){
			fs.mkdirSync(`/data/yml`);
		}
		// if(!fs.existsSync(`/data/${config.name}`)){
		// 	fs.mkdirSync(`/data/${config.name}`);
		// }
		//定义应用启动的yml
		let yml = 
`version: '2'
services:
  ${config.name}:
    image: vb6uoylk.mirror.aliyuncs.com/nicozhang/oncer
    container_name: ${config.name}
    restart: always
    logging: 
      driver: "json-file"
      options: 
        max-size: "5g"
    volumes:
      - "/var/run/docker.sock:/var/run/docker.sock:rw"
      - "${apppath}:/atweb/app:rw"
      - "/:/hostroot:rw"
      - "${ATWEB_DATA}/${config.name}:/data:rw"
      - "${ATWEB_DATA}/yml:/data/yml:rw"
      #atweb
    #entrypoint: bash
    command: bash -c "/node_modules/atweb/bin/app.sh ${status} ${config.configPath}"
    ports:
      - "${config.port}:80"
    network_mode: atweb
    environment:
      network: atweb
      datapath: ${ATWEB_DATA}
      apppath: ${apppath}
    tty: true`
;
		if(process.env.atweb_path){
			yml = yml.replace('#atweb', `- "${process.env.atweb_path}:/node_modules/atweb:rw"`);
		}
		fs.writeFileSync(`/data/yml/${config.name}.yml`, yml, 'utf8');
		const compose = spawn('docker-compose', ['-f', `/data/yml/${config.name}.yml`, 'up', '-d']);
		compose.stdout.on('data', (data) => {
			console.log(`${data}`);
		});
		compose.stderr.on('data', (data) => {
			console.log(`${data}`);
		});
		compose.on('close', (code) => {
			console.log(`docker启动成功：${config.name}`);
			lib.exec(`docker logs -f ${config.name}`);
		});
	}
};
module.exports = lib;