const Path = require('path');

const _static = {
    name: 'static',
    version: '1.0.0',
    register: function (server, options) {
    	if(options.config && options.config){
			options.config.forEach(item => {
			   //  server.route({
			   //      method: 'GET',
			   //      path: item.url + '/{file*}',
			   //      config: {
			   //      	//解析400错误
						// state: {
						// 	parse: false,
						// 	failAction: 'ignore'
						// },
				  //       handler: function (request, h) {
				  //       	var file = Path.join(item.path , request.params.file);
				  //           return h.file(file, {
				  //           	confine: false
				  //           });
				  //       }
			   //      }
			   //  });
				server.route({
				    method: 'GET',
				    path: `${item.url}/{param*}`,
			        config: {
			        	//解析400错误
						state: {
							parse: false,
							failAction: 'ignore'
						},
					    handler: {
					        directory: {
					            path: `${item.path}`,
					            listing: true
					        }
					    }
				    }
				});
			});
		}
    }
};

module.exports = _static;