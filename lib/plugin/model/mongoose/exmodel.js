const BaseModel = require("./base");

module.exports = (mongo, modelName,srcModel) => {
	var model = {};
	//融合
	srcModel(model);
	if(srcModel && mongo){
		var mongoose = require('mongoose');
		var Schema = mongoose.Schema;
		//新建schema
		const _schema = new Schema(model.fieldMap);
		modelName = model.name || modelName;
		var _model = mongo.model(modelName, _schema);
		//继承base，启用model实例
		var Model = new BaseModel(_model);
		Model.fieldMap = model.fieldMap;
		model.db = _model;
		for(let key in model){
			if(key != "fieldMap"){
				Model[key] = model[key];
			}
		}
		console.log(Model);
		return Model;
	}
};