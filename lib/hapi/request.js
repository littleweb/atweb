const UA = require('ua-parser-js');
module.exports = (request) => {
    let ua = UA(request.headers['user-agent']);
	let _vars = {};
    _vars.get = request.query || {};
    _vars.post = request.payload || {};
    _vars.form = Object.assign(_vars.get, _vars.post);
    _vars.session = request.session;
    _vars.cookie = request.state;
    _vars.ip = request.headers['x-real-ip'] || request.info.remoteAddress;
    _vars.host = request.info.host;
    _vars.hostname = request.info.hostname;
    _vars.referrer = request.info.referrer;
    _vars.url = request.url.href;
    //将_vars并入request
    request = Object.assign(request, _vars);
    request.ua = ua;
    request.data = request.data || {};
    request.data = Object.assign(request.data, _vars);
	return request;
}