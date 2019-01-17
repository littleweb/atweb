# redis-kv简化命令

> 基于redis原生的命令，封装了一版符合js语法书写习惯的函数。覆盖常用的数据操作。

> 所有命令均通过aync/await方式进行同步调用。

## 一、基础用法

### 1、赋值

- 字符串

```js
app.kv('key').val('字符串');
```

- json对象
> 对象存储会自动转换为字符串再进行存储，与hash存储有区别

```js
app.kv('json').val(
	{
		"name": "redis",
		"desc": "kv"
	}
);
```

- 数组
> 数组赋值需要注意：key数据类型会自动转换List类型

```js
app.kv('array').val([1,2,3]);
```

- 函数
> 使用场景：传入可执行的函数，返回的数据将会被写入缓存，同时返回结果

```js
app.kv('key').val(
	async () => {
		let data = await app.s.doc('xxx');
		return data;
	}
);
```

### 2、取值

- 统一取值语法，json和数组类型会在取值时自动转化为对应类型，无需再JSON.parse转换

```js
app.kv('key').val();
```

### 3、是否存在

```js
app.kv('key').have();
```

### 4、数据长度

> 字符串返回字符数
> hash和list返回子数据数量

```js
app.kv('key').len();
```

### 5、删除数据

```js
app.kv('key').del();
```


## 二、hash用法

### 1、赋值
> 与基础赋值唯一的区别是key与subkey之间以.进行连接，内容类型支持字符串、对象和数组（数组和对象会自动进行JSON.stringify）

```js
app.kv('key.subkey').val('value');
```

### 2、取值

```js
app.kv('key.subkey').val();
```

## 三、list用法

### 1、赋值
> `val()`传入数组类型的数据即可

```js
app.kv('list').val([1,2,3]);
```
### 2、取值

```js
app.kv('list').val();
```

### 3、取指定索引值

```js
app.kv('list').index(0);
```

### 4、范围取值
> `slice`：等同于js数组的slice方法

```js
app.kv('list').slice(0,-1);
```

### 5、追加数据
> `push`：等同于js数组的尾追加功能，返回新数据长度
> `unshift`：等同于js数组的头追加功能，返回新数据长度

```js
app.kv('list').push('4');
app.kv('list').push(['4','5',6]);
app.kv('list').unshift('0');
```
### 6、删除数据

> `pop`：等同于js数组的尾删除功能，返回被删除的数据
> `shift`：等同于js数组的头删除功能，返回被删除的数据

```js
app.kv('list').pop();
app.kv('list').shift();
```