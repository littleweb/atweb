var nunjucks = require('nunjucks');
const Path = require('path');

// var env = nunjucks.configure({
//     autoescape: true,
//     watch: false,
//     noCache: true
// });

const tpl = {
    name: 'tpl',
    version: '1.0.0',
    register: function (server, options) {
        server.decorate('toolkit', 'renders', function(tpl,data,request){
            var tail = tpl.substring(tpl.length-4,tpl.length);
            tpl = tail==".tpl"?tpl:tpl+".tpl";
            data = data || {};
            data._data = JSON.stringify(data);
            let tplInfo = Path.parse(tpl);
            let dir = options.config.output || options.config.path;
            var env = nunjucks.configure(dir, {
                autoescape: true,
                watch: false,
                noCache: true
            });
            function WebappExtension() {
                this.tags = ['webapp'];

                this.parse = function(parser, nodes, lexer) {
                    var tok = parser.nextToken();

                    var args = parser.parseSignature(null, true);
                    parser.advanceAfterBlockEnd(tok.value);

                    var body = parser.parseUntilBlocks('endwebapp');

                    parser.advanceAfterBlockEnd();

                    return new nodes.CallExtension(this, 'run', args, [body]);
                };

                this.run = function(context, url, body, errorBody) {
                    var ret = `<div>${body()}</div>`;
                    return ret;
                };
            }
            env.addExtension('WebappExtension', new WebappExtension());
            // var env = new nunjucks.Environment(new nunjucks.FileSystemLoader([
            //     dir
            // ]));
            let rdir = new RegExp(dir,"g");
            data.name = data.name || tplInfo.dir.replace(rdir, '').replace(/\//g, '');
            return (env.render(tpl, data));
        });
    }
};

module.exports = tpl;