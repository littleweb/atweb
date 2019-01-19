cd /
#更新npm依赖模块
rm package.json
rm package-lock.json
cp /atweb/app/package.json /package.json
npm i npm -g
# npm i --registry=https://registry.npm.taobao.org
npm i
# pm2 start /node_modules/atweb/bin/pm2/$1.json -- $2
pm2 start /node_modules/atweb/bin/pm2/$1.json
pm2 logs;