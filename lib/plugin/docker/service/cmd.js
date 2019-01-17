module.exports = cmd => {
	return new Promise((res ,rej) => {
		require('child_process').exec(cmd,{},function(err, result){	
			res(result);
		});
	});
}