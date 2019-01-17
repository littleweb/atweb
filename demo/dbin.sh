#!/bin/bash
# 几个变量
atweb_vision=latest
atweb_path="$PWD/../"
# 第一步：设置atweb存储路径
ATWEB_DATA='/tmp/atweb_data'

# 启动atweb
if [ "$(docker inspect --format="{{.State.Status}}" atweb)" != 'running' ]; then
  docker rm atweb
  docker run -i -d -t=true  --name="atweb" --net="host" --entrypoint="bash" \
      --env atweb_path="$atweb_path" \
      -v /var/run/docker.sock:/var/run/docker.sock:rw  \
      -v /:/hostroot  \
      -v $ATWEB_DATA:/data/:rw \
      -v $atweb_path:/atweb_path:rw \
      registry.docker-cn.com/nicozhang/atweb:$atweb_vision
	sleep 3
fi

# 第三步：执行开发命令
if [ "$1" = 'bash' ]; then
  docker exec -it $(docker exec -i atweb node /node_modules/atweb/bin/index.js $PWD bash) /bin/bash
else
  docker exec -it atweb node /node_modules/atweb/bin/index.js $PWD $*
fi