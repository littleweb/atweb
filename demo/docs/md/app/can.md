# 内置能力

> 模块内置能力提供了基础的应用实现和扩展接口的增强。

## 一、use方法

> 加载其他模块的方法，支持自定义路由和批量加载


- 加载一个模块

```js
app.use('/project', './server/project');
```

- 加载所有模块

```js
app.use('/', './server/*');
```

- 加载npm模块

```js
app.use('/mis', 'atweb-mis');
```

## 二、路由方法

> 支持`get`、`post`、`put`、`delete`、`patch`、`proxy`方法，详细见`路由能力`

## 三、on方法

> 运行时方法，为模块中的路由通信提供了自由处理的能力

- request：请求方法

```js
app.on('request', (req ,h) => {
	req.data.foo = '变量';
});
```

- response：输出方法

```js
app.on('response', (req ,h) => {
	req.data.foo = '变量';
});
```

## 四、addMethod

> 为模块原型增加扩展能力的方法

```js
app.addMethod('httpClient', require('axios'));
```

## 五、static

> 赋予目录静态访问的能力

```js
app.static('/html', './assets/html');
```

## 六、download

> 赋予目录下载文件的能力

```js
app.download('/download', './assets/download');
```