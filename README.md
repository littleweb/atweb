# atweb

> 基于hapi开发，易于扩展和高效开发的MVC业务框架。

### 目标

* 更加清晰的路由结构
* 重业务，轻框架
  * 强化底层封装，开放更多便捷接口

### 一、安装atweb

```
npm i atweb -g
```

### 二、创建一个web应用

```
const atweb = require('atweb')(__dirname);
atweb.get('/', (req, res) => {
    res('首页');
}
```

##### 访问

```
http://localhost:9223
```

> 默认支持0配置，或者自己在根目录下创建一个配置文件config.json

```
{
    //端口,默认9223
    "port": 9223,
    //静态文件，默认static
    "static": {
        "url": "/static",
        "path": "/static"
    },
    //数据库配置
    "datebase": {
        "mongoose": {

        }
    },
    //缓存设置
    "cache": {
        //redis设置，默认localhost:6379
        "redis": {
            "host": "localhost",
            "port": 6379
        }
    }
}
```

### 三、加载子模块

> 子模块相当于一个子应用，拥有独立的MVC模型，通过use命令加载使用

##### 创建一个子模块

```
|____home
| |____index.js
| |____model
| |____view
| |____controller
| |____service
```

* index.js

```
module.exports = app => {
    app.get('/', (req,res) => {
        res.render('index.tpl',{
            'title': '首页'
        });
    });
    //加载关于我们
    app.use('/about', '/controller/about');
    //或者
    app.use('/about');
}
```

##### 加载子模块

```
const atweb = require('atweb')(__dirname);
atweb.get('/', (req, res) => {
    res('首页');
}
//加载子模块：home
atweb.use('/home');
//自定义路由
atweb.use('/index', '/home');
```


## 子模块

> 每个子模块都是一个标准的MVC小应用

```
const atweb = require('atweb')(__dirname);

//加载子模块：home
//写法一：路由与目录同名
atweb.use('/home');
//写法二：自定义路由
atweb.use('/index', '/home');
```

### 一、目录结构

```
|____home
| |____index.js
| |____model
| |____view
| |____controller
| |____service
```

* model：数据
* view：视图模板
* controller：页面控制器
* service：业务逻辑
* index.js：路由索引
* config.json：配置文件（可选）

#### 1\) 模块配置

```
./config.json
```

* 是否需要登录
* 支持哪些浏览器
* 是否支持跨域

```
{
    "login": {
        "need": true,
        "unless": ["api"],
        "url": "/ucenter/login"
    },
    browser: ['chrome'],
    cross: true
}
```

#### 2\) 路由索引

```
./index.js
```

```
module.exports = app => {
    //简单的逻辑也可以直接在index.js里完成
    app.get('/', (req,res) => {
        res.render('index.tpl',{
            'title': '首页'
        });
    });

    //复杂的，可以通过use来挂载controller
    //写法一：自动挂载/controller/about，并以about为路由名称
    app.use('/about');
    //写法二：可以自定义路由名称
    app.use('/about', '/controller/about');
}
```

#### 3\) 控制器：

```
./about.js
```

> 子页面也可以理解为一个子应用，app继承父模块app的所有属性

```
module.exports = app => {
    app.get('/', (req,res) => {
        res('关于我们');
    });
    //联系我们
    app.get('/contact', (req,res) => {
        res.render('about/contact.tpl);
    });
    //提交数据
    app.post('/contact', function!(req,res){
        //接收数据
        const data = {
            name: req.post.name,
            content: req.post.content,
            email: req.post.email
        };
        //发送到客服邮箱
        var result = await app.service.sendMail(data);
        res({
            errCode: result.errCode,
            msg: result.msg,
            data: result.data
        });
    });
}
```

### 二、APP挂载功能

#### 1）**APP默认会挂载当前模块的基础功能**

> * app.model：数据
> * app.service：业务逻辑
> * app.APPS：当前站点的应用集合
>   * app.APPS.user.model.user：这些可以实现跨模块调用

#### 2）before

> 请求前行为，可做为模块的预处理

```
module.exports = app => {
    app.before((req,res) => {
        req.data.title = "关于我们";
        //在当前模块下所有请求前执行
    });
    app.get('/', (req,res) => {
        let data = req.data;
        res.render('index',{data});
    });
    //output->data：{'title':'关于我们'}
}
```



> 对于常规的get、post请求，接收到的数据会自动挂载到实例的req上.

#### get请求

```
module.exports = app => {
    app.get('/form/get',(req,res) => {
        res({
            msg: 'get请求',
            data: req.get.name
        });
    }
}
```

#### post请求

```
module.exports = app => {
    app.post('/form/get',(req,res) => {
        res({
            msg: 'post请求',
            data: req.post.name
        });
    }
}
```



> redis缓存默认挂载在第一个app实例上。

#### 缓存格式

```
key = ['产品','页面','业务','行为','内容'];
value = '值';
redis.set(md5(key),value);

//case
key = ['cat','segment','trans','en>zh','hello word'];
value = '世界，你好！';
redis.set(md5(key.join('_'),value);
```

#### 设置缓存

```
module.exports = app => {
    app.get('/redis/set', (req,res) => {
        app.redis.set('key','value');
        res('设置成功');
    });
}
```

#### 取缓存

```
module.exports = app => {
    app.get('/redis/get', async function(req,res){
        var data = await app.redis.get('key');
        res({
            msg: '获取成功',
            data: data
        });
    });
}
```



> atweb的模板引擎使用的是swig\|nunjucks，他的语法更接近smarty，也比较容易阅读和使用

#### 引用模板

```
module.exports = app => {
    app.get('/tpl/render',(req,res) => {
        res.render('foo',
            {
                msg: '一个数据',
                json: {
                    name: 'atweb'
                }
            }
        };
    }
}
```

* foo.tpl

```
{{msg}}
{{json|raw|json_encode}}
```

##### 保留变量

* 表单变量

> 可以模板里直接使用get或post过来的变量

```
{{get.name}}
{{post.password}}
```

* session和cookie

```
{{session.userInfo}}
{{cookie.sid}}
```



### 数据库

#### 一、mongodb

> atweb默认使用mongoose做为mongodb连接器

##### 1、通过配置即可使用

```
//config.json
{
    //数据库配置
    "datebase": {
        "mongoose": {
            "host": "mongo:27017",
            "dbname": "atweb"
        }
    }
}
```

##### 2、定义一个model

> model自动继承baseModel，开发时只需简单配置即可使用

```
// /user/model/user.js
module.exports = model => {
     //定义字段
     model.fieldMap = {
          user_name: String,
          password: String,
          create_time: {type: Date, default: Date.now}
     };
     //自定义方法
     model.getAdmin = () => {
          return new Promise(function(resolve, reject){
               model.db.find().exec(result => {
                    resolve(result);
               });
          });
     }
}
```

##### 3、使用model

* 获取数据

```
// /user/page/list.js
module.exports = app => {
    app.get('/list', async function(req,res){
        var userList = await app.model.user.list();
        res({
            'errCode': 200,
            'msg': '获取成功',
            'data': {
                'userList': userList
            }
        });
    });
}
```

* 存储数据

```
// /user/page/reg.js
module.exports = app => {
    app.post('/save', async function(req,res){
        var userData = {
            user_name: req.data.user_name,
            password: req.data.password
        };
        var result = await app.model.user.save(userData);
        res({
            'errCode': result.errCode,
            'msg': result.msg,
            'data': {
                'userInfo': result.data
            }
        });
    });
}
```

#### baseModel

```
//存储数据
var result = await app.model.save(vo);

//根据id获取数据
var result = await app.model.getById(id);

//upsert：更新或插入
var result = await app.model.upsert(doc);

//获取一个列表
var result = await app.model.list(vo);

//获取总数
var result = await app.model.total(query);

//删除记录
var result = await app.model.delete(id);

//返回数据
var result = {
    errCode: 0,
    msg: '成功',
    data: data
};
```



### cookie

##### 一、取cookie

> cookie会自动挂载到req上，方便取数据

```
module.exports = app => {
    app.get('/cookie/get', (req,res) => {
        var uid = req.cookie('uid');
        res(uid);
    });
}
```

##### 二、设置cookie

```
module.exports = app => {
    app.get('/cookie/set', (req,res) => {
        req.cookie('uid','123');
        res(uid);
    });
}
```

### session

##### 一、取session

```
module.exports = app => {
    app.get('/session/get', (req,res) => {
        var uid = req.session.uid;
        res(uid);
    });
}
```

##### 二、设置session

```
module.exports = app => {
    app.get('/session/set', (req,res) => {
        req.session.uid = 123;
        res(uid);
    });
}
```



```
{
    "port": 80,
    "static": {
        "url": "/static",
        "path": "/static"
    },
    "datebase": {
        "mongoose": {
            "host": "mongo",
            "dbname": "atweb"
        }
    },
    "auth": {
        "type": "login",
        "service": "common.service.login"
    }
}
```

端口

```
"port": 80
```

静态路径

```
"static": {
    "url": "/static",
    "path": "/static"
}
```

数据库

```
"datebase": {
    "mongoose": {
        "host": "mongo",
        "auth": "root@123456",
        "dbname": "atweb"
    },
    "elasticsear": {
        "host": "es",
        "auth": "root@123456",
        "index": "atweb"
    }
}
```

登录验证

> 登录方式

```
"auth": {
    "type": "login",
    "service": "common.service.login"
}
```

> basic auth

```
"auth": {
    "type": "basicAuth",
    "list": [
        {
            "username": "user1",
            "password": "psw1"
        }
    ]
}
```

> jwt方式

```
"auth": {
    "type": "jwt",
    "key": "123456xxxxx"
}
```