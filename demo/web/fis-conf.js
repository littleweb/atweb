const ug = require('fis3-ug');
const path = require('path');
const fs = require('fs');

fis.set('project.ignore', [
	'fis-conf.js'
]);
fis.config.set("project.watch.usePolling", true);

const files = fs.readdirSync('./');
var as = [];
files.forEach(function(ele,index){
    var info = fs.statSync(ele);
    if(info.isDirectory()){
    	as.push(ele);
    }     
});

as.forEach(aitem => {
	fis.media('dev')
		//编译js
		.match(`/${aitem}/{*,**/*}.js`,{
			packTo: `/js/${aitem}.js`,
		    postprocessor: function (content, file, settings){
		    	return content;
		    }
		})
		//编译css
		.match(`/${aitem}/{*,**/*}.css`,{
			packTo: `/css/${aitem}.css`,
			rExt: 'css',
			parser: fis.plugin('less-2.x')
		})
		.match(`/${aitem}/{*,**/*}.png`, {
			release: '/images/$0'
		})
		.match(`/${aitem}/{*,**/*}.tpl`, {
			release: '/$0',
		    postprocessor: function (content, file, settings){
		    	var t = Date.now();
		    	content = content.replace(/%t%/g,t);
		        return content;
		    }
		});
	fis.media('online')
		//编译js
		.match(`/${aitem}/{*,**/*}.js`,{
			packTo: `/js/${aitem}.js`,
			optimizer: fis.plugin('uglify-js'),
		    postprocessor: function (content, file, settings){
		    	return ug(content);
		    }
		})
		//编译css
		.match(`/${aitem}/{*,**/*}.css`,{
			packTo: `/css/${aitem}.css`,
			rExt: 'css',
			parser: fis.plugin('less-2.x'),
			optimizer: fis.plugin('clean-css')
		})
		.match(`/${aitem}/{*,**/*}.png`, {
			release: '/images/$0'
		})
		.match(`/${aitem}/{*,**/*}.tpl`, {
			release: '/$0',
		    postprocessor: function (content, file, settings){
		    	var t = Date.now();
		    	content = content.replace(/%t%/g,t);
		        return content;
		    }
		});
});