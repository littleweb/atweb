# basic auth

```js
app.auth.basic(['user:1234']).unless(['/data', '/']);
```

- basic：数组，可以增加多个账号

- unless：数组，过滤掉一些url