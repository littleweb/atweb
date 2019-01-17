#!/bin/bash
#解析json
function json_extract(){
  local key=$1
  local json=$2
  local string_regex='"([^"\]|\\.)*"'
  local number_regex='-?(0|[1-9][0-9]*)(\.[0-9]+)?([eE][+-]?[0-9]+)?'
  local value_regex="${string_regex}|${number_regex}|true|false|null"
  local pair_regex="\"${key}\"[[:space:]]*:[[:space:]]*(${value_regex})"
  if [[ ${json} =~ ${pair_regex} ]]; then
    echo $(sed 's/^"\|"$//g' <<< "${BASH_REMATCH[1]}")
  else
    return 1
  fi
}

# 进入docker内执行
if [ "$1" = 'docker' ]; then 
	cd /atweb
	#更新npm依赖模块
	rm package.json
	rm package-lock.json
	cp /atweb/app/package.json /atweb/package.json
	npm install --registry=https://registry.npm.taobao.org
	cd /atweb
	cp /atweb/node_modules/atweb/bin/web.js /atweb/web.js
	if [ "$2" = 'dev' ]; then
		#启动服务
		pm2 start web.js --name='app' --watch --ignore-watch='storage node_modules yml app/.git app/_data app/web *.tpl' -- /atweb/app dev
	fi
	if [ "$2" = 'online' ]; then
		#启动服务
		pm2 start web.js -i 2 --node-args='--max-old-space-size=4096' --name='app' -- /atweb/app online
	fi
	pm2 logs app
# docker启动命令
else
	#基础配置文件
	config=`cat $PWD/config.json`
	#应用名称
	name=`json_extract name "$config"`
	APP=${name//\"/}
	#应用端口
	port=`json_extract port "$config"`
	PORT=${port//\"/}
	# 存储路径设置：默认(/tmp/atweb_data)
	if [ ! -d "/tmp" ]; then
		cd /
		mkdir "tmp"
		cd /tmp
		mkdir atweb_data
	fi
	DATAPATH='/tmp/atweb_data'

	#本地化配置
	localConfig=`cat $PWD/.config.json`
	if [ -n "$localConfig" ]; then 
		if [ -n "$localConfig" ]; then 
			name=`json_extract name "$localConfig"`
			APP=${name//\"/}
			port=`json_extract dockerPort "$localConfig"`
			PORT=$port
			datapath=`json_extract datapath "$localConfig"`
			if [ -n "$datapath" ]; then
				DATAPATH=$datapath
			fi
		fi
	fi
	# 创建应用独享存储目录
	if [ ! -d "$DATAPATH/$APP" ]; then
		cd $DATAPATH
		mkdir $APP
		cd $DATAPATH/$APP
		mkdir yml
	fi
#读取yml文件
yml=`cat << EOF
version: '2'
services:
  APP:
    image: registry.docker-cn.com/nicozhang/atweb:v0.03
    container_name: APP
    restart: always
    volumes:
      - "$PWD:/atweb/app:rw"
      - "DATAPATH/APP:/data:rw"
      - "DATAPATH/APP/hapi/cache:/data/hapi/cache:rw"
      - "DATAPATH/APP/node_modules:/atweb/node_modules:rw"
      - "DATAPATH/APP/logs/pm2:/root/.pm2/logs:rw"
      - "DATAPATH/APP/logs/log4js:/root/.log4js/logs:rw"
      - "/var/run/docker.sock:/var/run/docker.sock:rw"
      - "DATAPATH/APP/yml:/atweb/yml"
      - "DATAPATH/APP/test:/atweb/test"
    command: bash -c "chmod +x -R /atweb/app/bin.sh;/atweb/app/bin.sh docker DEV"
    ports:
      - "PORT:80"
    network_mode: NET
    environment:
      network: NET
      datapath: DATAPATH
      apppath: $PWD
    tty: true
EOF
`
	# atweb框架开发调试
	if [ "$1" = 'atweb' ]; then 
		atweb='- "DATAPATH/APP/test:/atweb/test"'
		ATWEB='- "$PWD/../:/atweb/node_modules/atweb:rw"'
		yml=${yml//$atweb/$ATWEB}
	fi
	yml=${yml//ATWEB/$ATWEB}

	#替换应用名称
	yml=${yml//APP/$APP}
	#替换端口映射
	yml=${yml//PORT/$PORT}
	#替换存储路径
	yml=${yml//DATAPATH/$DATAPATH}

	#创建私有网络: atweb
	docker network create atweb
	yml=${yml//NET/atweb}

	# 开发命令选项
	case "$1" in
		# 查看docker日志
		"log")
			docker logs -f $APP
		;;
		# 进入容器
		"bash")
			docker exec -it $APP /bin/bash
		;;
		# 重启app
		"restart")
			docker exec -it $APP pm2 restart app
		;;
		# 更新npm
		"npm")
			docker exec -it $APP /bin/bash /atweb/app/bin.sh docker npm
		;;
		# 停止
		"stop")
			docker-compose -f $DATAPATH/$APP/yml/$APP.dev.yml stop
			# for file in $DATAPATH/yml/*
			# do
			# 	docker-compose -f $file stop
			# done
		;;
		#上线
		"online")
			yml=${yml//DEV/online}
			echo "${yml}" > $DATAPATH/$APP/yml/$APP.online.yml
			#启动应用
			docker-compose -f $DATAPATH/$APP/yml/$APP.online.yml up -d
		;;
		# 更新代码
		"update")
			echo '更新中'
			git pull
			docker exec -it $APP /bin/bash /atweb/app/bin.sh docker online
			echo '更新成功'
		;;
		# 默认: 本地开发
		*)
			yml=${yml//DEV/dev}
			echo $DATAPATH/$APP/yml/$APP.dev.yml
			echo "${yml}" > $DATAPATH/$APP/yml/$APP.dev.yml
			#启动应用
			docker-compose -f $DATAPATH/$APP/yml/$APP.dev.yml up -d
			docker logs -f $APP
		;;
	esac
fi