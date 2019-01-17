# 业务能力

> 路由为业务逻辑提供入口，业务为路由完善功能实现，业务逻辑会自动挂载在`app.service`对象上，无需另外引用，可以直接通过`app.service.xxx`来调用。

- 目录结构

```shell
|-- service
	|-- uuid.js
	|-- nlp
		|-- word_total.js
```

- 调用

```js
app.service.uuid();
app.service.nlp.word_total();
```