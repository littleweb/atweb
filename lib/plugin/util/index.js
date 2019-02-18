module.exports = app => {
	//增加$链方法，全模块间可以随意调用
	let $chain = {};
	for(let key in global.ATWEB.mmap){
		let module = global.ATWEB.mmap[key];
		if(module.namespace){
			//相对路径
			let dir = module.modulePath.replace(global.ATWEB.mmap[module.namespace].modulePath, '');
			dir = dir || '/';
			dir = dir == '/'?'':`:${dir}`;
			//挂载url结构
			$chain[`${module.namespace}:${module.url}`] = module.app;
			//挂载路径结构
			$chain[`${module.namespace}${dir}`] = module.app;
			//子模块挂载到父级路径链
			if(module.namespace != module.app.option.parent.option.namespace){
				let dir = module.modulePath.replace(global.ATWEB.mmap[module.app.option.parent.option.namespace].modulePath, '')
				$chain[`${module.app.option.parent.option.namespace}${dir}`] = module.app;
			}
			// console.log(`root路径：${global.ATWEB.mmap[module.namespace].modulePath}`);
			// console.log(`空间：${module.namespace}`);
			// console.log(`名称：${module.name}`);
			// console.log(`地址：${module.url}`);
			// console.log(`路径：${module.modulePath}`);
			// console.log(`相对：${dir}`);
		}
	}
	app.addMethod('$', mpath => {
		return $chain[mpath];
	});
	global.ATWEB.rmap.forEach((ritem,index) => {
		if(ritem.module._before){
			ritem._before = ritem.module._before;
		}
	});
}