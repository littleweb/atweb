const Joi = require('joi');
module.exports = {
	"name": "获取信息",
	"get": {
		"id": Joi.number().description('id'),
		"uid": Joi.string().description('uid')
	},
	"post": {
		"id": Joi.number().description('id'),
		"uid": Joi.string().description('uid')
	}
}