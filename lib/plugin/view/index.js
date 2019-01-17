const fs = require('fs');
const { spawn } = require('child_process');
module.exports = app => {
	for(let key in global.ATWEB.mmap){
		let mitem = global.ATWEB.mmap[key];
		let mpath = `${mitem.modulePath}/view`;
		let view = {};
		if(fs.existsSync(mpath)){
			let tree = require("dir2json")(mpath, false);
			//递归路径
			let fn = function(parent,path){
				if(path.children){
					parent[path.label] = parent[path.label] || {};
					path.children.forEach(function(item){
						if(item.type == 'file'){
							parent[path.label][item.label.split('.')[0]] = item.path;
						}
						if(item.children){
							fn(parent[path.label],item);
						}
					});
				}
			}
			fn(view,tree);
		}
		mitem.app.v = mitem.app.view = view.view || {};
	}
	//FIS编译
	let fisInfo = global.CONF.view;
	if(fisInfo && fisInfo['package'] == 'fis'){
		let dev = global.DEV?'dev':'online';
		let wd = global.DEV?'-wd':'-d';
		const fis = spawn('/usr/bin/fis3', ['release', dev, wd, fisInfo.output], {
			cwd: fisInfo.path
		});
		fis.stdout.on('data', (data) => {
			console.log(`FIS编译: ${data}`);
		});
		fis.stderr.on('data', (data) => {
			console.log(`FIS错误: ${data}`);
		});
		fis.on('close', (code) => {
			console.log(`FIS编译成功`);
		});
	}
}