const fs = require('fs');
module.exports = info => {
	let conf = 
`
server{
        listen 80;
        server_name localhost ${info.domain};
        index index.html;
        client_max_body_size 20M;
        location / {
                proxy_set_header X-Real-IP $remote_addr;
                proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
                proxy_set_header Host $http_host;
                proxy_set_header X-NginX-Proxy true;
                proxy_pass http://localhost:${info.port};
                proxy_redirect off;
        }
}
`;
	if(!fs.existsSync(`/data/yml/nginx`)){
		fs.mkdirSync(`/data/yml/nginx`);
	}
	fs.writeFileSync(`/data/yml/nginx/${info.app}.conf`, conf, 'utf-8');
	return {
		status: 200,
		msg: "域名配置成功"
	};
}