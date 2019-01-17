const axios = require('axios');
module.exports = app => {
	app.addMethod('axios', axios);
    global.HAPI.ext('onPreResponse', function(req, h){
        // req.response.header('X-Request-Id', (req.headers['x-request-id'] || "atman"));
		app.axios.defaults.headers.common['request_id'] = req.headers['x-request-id'] || "atman";
        return h.continue;
    });
}