# 内容输出

- 文本输出

```js
app.get('/text', (req, h) => {
	h.text('文本');
});
```

- json输出

```js
app.get('/json', (req, h) => {
	h.json({
		name: "json"
	});
});
```

- jsonp输出

```js
app.get('/jsonp', (req, h) => {
	h.jsonp({
		name: "json"
	});
});
```

- jump跳转

```js
app.get('/jump', (req, h) => {
	h.jump('/text');
});
```

- download下载

```js
app.get('/路径', '文件名');
```