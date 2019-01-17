# 数据能力

> 自动挂载在`app.model`，目前内置支持`json`,`mongo`

- 目录结构

```shell
|-- model
	|-- config.json
	|-- User.js
```

`User.js`

```js
module.exports = model => {
	//建立字段表结构
	model.fieldMap = {
		user_name: {type: String, default: "", name: "用户名"},
		nick_name: {type: String, default: "", name: "昵称"},
		status: {type: String, default: "", name: "状态"}
	};
	//增加独立方法
	model.getByUsername = (user_name) => {
		return new Promise(function(resolve, reject){
			model.db.find({user_name},{},function(err, data){
				err && reject(err);
				resolve(data[0]);
			});
		});
	}
};
```

- 调用

```js
app.model.config();
app.model.User();
```