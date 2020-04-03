const fs = require('fs');
const log = require('./plugin/log.js');
module.exports = (request, h, route) => {
    h = log(request, h);
	//文本输出
	h.text = function(text){
		text = text || '';
		h._resHtml = text;
	};
	h.jump = function(url){
		h._resHtml = h.redirect(url);
	};			            	
	//json输出
	h.json = function(json){
		json = json || {};
		h._resHtml = json;
	};		            	
	//jsonp输出
	h.jsonp = function(json){
		let cb = request.get.cb || request.get.callback;
		json = json || {};
		h._resHtml = `${cb}(${json})`;
	};
	//错误码输出
	h.code = function(code,msg){
		h._resHtml = h.response(msg).code(code);
	};
	//文件输出
	h.download = function(file, filename){
		h._resHtml = h.file(file, {
			filename: filename,
			mode: 'attachment',
			confine: false
		});
	};	
	//代理
	h._proxy = function(vo){
		let vos = {
			host: 'baidu.com', port: 80, protocol: 'https' 
		}
		h._resHtml = h.proxy(vos);
	};
	//模板渲染方法
	h.render = h.tpl = function(tpl,data){
		data = data || {};
    	//追加引入变量
	    if(request.data){
		    for(let ditem in request.data){
		    	data[ditem] = request.data[ditem];
		    }
	    }
	    //模块路径处理：兼容views、配置多路径
	    let tail = tpl.substring(tpl.length-4,tpl.length);
	    let tplFile = tail==".tpl"?tpl:tpl+".tpl";
	    let TF = "";
	    let tplPath = [];
		if(route.CONF.view.output){
			tplPath.push(route.CONF.view.output);
			data.viewPath = route.CONF.view.output;
		}else{
			tplPath.push(route.CONF.view.path);
			data.viewPath = route.CONF.view.path;
		}
		// tplPath.push(route.modulePath + "/view/");
		//layout默认值
	    tplPath.forEach(item => {
	    	let tf = `${item}${tplFile}`;
	    	tf = tf.replace(/\/\//g,'\/');
	    	if(fs.existsSync(tf)){
	    		TF = `${item}${tplFile}`;
	    	}
	    });
	    if(TF){
			h._resHtml = h.renders(TF,data);
	    }else{
			h._resHtml = '模板不存在';
	    }
	}
	return h;
}