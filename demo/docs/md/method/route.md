# 路由能力

> 支持`get`、`post`、`put`、`delete`、`patch`、`proxy`方法

- `get`方法

```js
app.get('/', (req, h) => {
	h.text('get');
});
```

> 内置变量

```js
console.log(req.get.xxx);
console.log(req.form.xxx);
```

- `post`方法

```js
app.post('/', (req, h) => {
	h.text('post');
});
```

> 内置变量

```js
console.log(req.form.xxx);
```

- `proxy`方法

```js
app.proxy('/baidu', 'https://baidu.com');
```