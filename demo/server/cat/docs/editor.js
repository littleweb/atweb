const Joi = require('joi');
module.exports = {
	"name": "编辑器",
    "note": "支持多文档",
    "get": {
        "docid": Joi.string().description('文档id')
    }
}