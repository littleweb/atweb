# 路由数据

- session

```js
app.get('/' ,(req, h) => {
	req.session.view = 1;
	let view = req.session.view;
	h.text(view);
});
```

- data

> 内置变量，挂载到req对象

```js
console.log(req.get.xxx);
console.log(req.post.xxx);
console.log(req.form.xxx);
```