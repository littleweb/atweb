module.exports = app => {
	//处理模块间验证依赖
	for(let key in global.ATWEB.mmap){
		let mitem = global.ATWEB.mmap[key];
		if(mitem.app.option && mitem.app.option.parent && mitem.app.option.parent.auth.authBasic){
			global.ATWEB.mmap[key].app.auth.authBasic = true;
			global.ATWEB.mmap[key].app.auth._unless = mitem.app.option.parent.auth._unless;
			global.ATWEB.mmap[key].app.auth.authName = mitem.app.option.parent.auth.authName;
		}		
		if(mitem.app.option && mitem.app.option.parent && mitem.app.option.parent.auth.authLogin){
			global.ATWEB.mmap[key].app.auth.authLogin = true;
			global.ATWEB.mmap[key].app.auth._unless = mitem.app.option.parent.auth._unless;
			//global.ATWEB.mmap[key].app.auth.authName = mitem.app.option.parent.auth.authName;
			global.ATWEB.mmap[key].app.auth.loginUrl = mitem.app.option.parent.auth.loginUrl;
		}
	}
	//按路由挂载
	global.ATWEB.rmap.forEach((ritem,index) => {
		if(ritem.module.auth.authBasic){
			let authBasic = true;
			ritem.module.auth._unless.forEach(uitem => {
				uitem = uitem.replace('/*', "");
				if(uitem == ritem.path.substr(0,uitem.length)){
					authBasic = false;
				}
			});
			//basic登录
			if(authBasic){
				global.ATWEB.rmap[index].config.auth = ritem.module.auth.authName;
			}
		}		
		if(ritem.module.auth.authLogin){
			let authLogin = true;
			ritem.module.auth._unless.forEach(uitem => {
				if(uitem == ritem.path){
					authLogin = false;
					ritem.module.auth.authLogin = false;
				}
			});
			//login登录
			if(authLogin){
				ritem.loginUrl = ritem.module.auth.loginUrl;
				ritem.loginFn = (request, h) => {
					if(!request.session.userInfo){
						return false;
					}else{
						return true;
					}
				}
			}
		}
	});
}