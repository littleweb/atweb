module.exports = path => {
	return new Promise((res ,rej) => {
		require('child_process').exec(`curl --unix-socket /var/run/docker.sock http://localhost${path}`,{},function(err, result){	
			res(result);
		});
	});
}