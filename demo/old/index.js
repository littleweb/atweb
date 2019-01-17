const aweb = require('../../index.js')(__dirname);
aweb.init();

//加载模块
aweb.use("/", "/home");
aweb.use("/demo");

aweb.start();