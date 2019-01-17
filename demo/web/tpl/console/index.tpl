<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<title>atweb控制台</title>
	<meta name="description" content="Description">
	<meta name="viewport" content="width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0">
	<link rel="stylesheet" href="//unpkg.com/docsify/lib/themes/vue.css">
	<link rel="stylesheet" href="//unpkg.com/element-ui@1.4.0/lib/theme-default/index.css">
</head>
<body>
	{% raw %}
	<div id="console">
		<el-card style="margin: 10px;" shadow="never">
			<div slot="header" class="clearfix">
			    <span>应用列表</span>
			    <el-button style="float: right; padding: 3px 0" type="text">增加应用</el-button>
			</div>
			<el-row style="padding: 20px 50px;">
				<el-col :span="8" v-for="(item, index) in list" v-if="item.config">
					<el-card style="margin: 5px;">
						<div slot="header" class="clearfix">
						    <span>{{item.config.desc}}</span>
						    <el-button style="float: right; padding: 3px 0" type="text">应用配置</el-button>
						</div>
						<div class="text item">
							<el-row>
								<el-col :span="5">名称</el-col>
								<el-col :span="11">{{item.name}}</el-col>
							</el-row>
						</div>					
						<div class="text item">
							<el-row>
								<el-col :span="5">IP</el-col>
								<el-col :span="11">{{item.ip}}</el-col>
							</el-row>
						</div>					
						<div class="text item">
							<el-row>
								<el-col :span="5">端口</el-col>
								<el-col :span="11">{{item.config.port}}</el-col>
							</el-row>
						</div>					
						<div class="text item">
							<el-row>
								<el-col :span="5">域名</el-col>
								<el-col :span="12" v-if="item.config.domain">{{item.config.domain}}</el-col>
								<el-col :span="12" v-if="!item.config.domain">未设置</el-col>
								<el-col :span="7" v-if="!item.config.domain" style="text-align: right;">
									<el-button @click="app=item;dlgshow=true;" type="primary" size="small">设置</el-button>
								</el-col>							
								<el-col :span="7" v-if="item.config.domain">
									<el-button @click="app=item;dlgshow=true;" type="primary" size="small" plain>更新</el-button>
									<el-button @click="" type="danger" size="small">重启</el-button>
								</el-col>
							</el-row>
						</div>
					</el-card>
				</el-col>
			</el-row>
		</el-card>
		<el-dialog title="设置域名" :visible.sync="dlgshow" width="50%">
			<el-form :model="app" v-if="app">
				<el-form-item label="应用名称">
					<el-input v-model="app.name" auto-complete="off" readonly="true"></el-input>
				</el-form-item>				
				<el-form-item label="应用端口">
					<el-input v-model="app.config.port" auto-complete="off" readonly="true"></el-input>
				</el-form-item>				
				<el-form-item label="设置域名">
					<el-input v-model="app.config.domain" auto-complete="off"></el-input>
				</el-form-item>
			</el-form>
			<div slot="footer" class="dialog-footer">
				<el-button @click="dlgshow = false">取 消</el-button>
				<el-button type="primary" @click="saveDomain">确 定</el-button>
			</div>
		</el-dialog>
	</div>
	{% endraw %}
	<script src="//cdn.jsdelivr.net/npm/vue/dist/vue.min.js"></script>
	<script src="//cdn.bootcss.com/axios/0.18.0/axios.js"></script>
	<script src="//unpkg.com/element-ui/lib/index.js"></script>
	<script type="text/javascript">
		new Vue({
			el: "#console",
			data: {
				list: {{list|dump|safe}},
				app: null,
				dlgshow: false,
				domainForm: {

				}
			},
			methods: {
				saveDomain: function(){
					var data = {
						app: this.app.name,
						config: JSON.stringify(this.app.config)
					};
					axios.post('/__console/nginx/domain', data).then(data => {
						if(data.status == 200){
							this.dlgshow = false;
						}
					});
				}
			}
		});
	</script>
</body>
</html>