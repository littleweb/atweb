#!/bin/bash
# 第一步：启动中转容器atweb
if [ "$(docker inspect --format="{{.State.Status}}" atweb)" != 'running' ]; then
	docker rm atweb
	atweb_path="$PWD/../"
	docker run -i -d -t=true -w="/" --name="atweb" --net="host" --entrypoint="bash" \
	  -v /var/run/docker.sock:/var/run/docker.sock:rw  \
	  -v /:/hostroot  \
	  -v /tmp/atweb_data:/data/:rw \
	  -v /tmp/atweb_data/yml:/data/yml:rw \
	  registry.docker-cn.com/nicozhang/atweb
	sleep 3
	docker exec -it atweb npm i atweb
fi
# 第二步：执行开发命令
if [ "$1" = 'bash' ]; then
	docker exec -it $(docker exec -i atweb node /node_modules/atweb/bin/index.js $PWD bash) /bin/bash
else
	docker exec -it atweb node /node_modules/atweb/bin/index.js $PWD $*
fi