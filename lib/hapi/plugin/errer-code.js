'use strict';

const errer_code = {
    name: 'errer-code',
    version: '1.0.0',
    register: function (server, options) {
		server.ext('onPreResponse', function(request, h){
			var errer = request.response.output;
			if(errer){
				var errno = errer.payload.statusCode;
				var msg = errer.payload.message;
				if(options.config && options.config[errer.payload.statusCode]){
					msg = options.config[errer.payload.statusCode].msg;
				}
				request.response.output.payload = {
					errno: errno,
					msg: msg
				};
			}
			return h.continue;
		});
    }
};

module.exports = errer_code;