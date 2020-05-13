const UA = require('ua-parser-js');
const moment = require('moment');
const elasticsearch  = require('elasticsearch')
const IP2Region = require('ip2region');
const IpQuery = new IP2Region();
module.exports = (req, h) => {
    let client;
    if(global.CONF.onelog && global.CONF.onelog.es){
//         client = new Client({ node: 'global.CONF.onelog.es',log:'trace' })
        client = new elasticsearch.Client({
            host: global.CONF.onelog.es,
            // log: 'trace'
        });
        function save(doc){
            let docs = [];
            docs.push({
                index: {
                    _index: 'one-log',
                    _type: 'log'
                } 
            });
            docs.push(doc);
            let content = {
                body: docs
            }
            client.bulk(content, function (err,resp){
                console.log(err);
            });
        }
        h.log = (event = 'debug', data = {}, tag = ['调试']) => {
            let ua = UA(req.headers['user-agent']);
            data = JSON.stringify(data,null,0);
            let ipData = IpQuery.search(req.ip);
            let log = {
                event,data,tag,
                up: {
                    ua,
                    ip: req.ip,
                    sid: req.cookie.sid
                },
                time: moment().format()
            };
            if(ipData){
                log.up.area = ipData;
            }
            console.log(`事件: ${log.event}`);
            console.log(`数据: ${data}`);
            console.log(`用户: ${JSON.stringify(log.up,null,0)}`);
            console.log(`标签: ${log.tag}`);
            console.log(`时间: ${log.time}`);
            save(log);
        };
        h.logQuery = (dsl) => {
            return new Promise(function(res,rej){
                client.search({
                    index: 'one-log',
                    type: 'log',
                    body: dsl
                }).then(function (resp,r){
                    let hits = resp.hits.hits;
                    res({hits,count:resp.hits.total});
                }, function (err) {
                    if(err){
                        res(null);
                    }
                });
            });
        };
    }
    return h;
}