FROM ubuntu

#安装curl
RUN apt-get update
RUN apt-get install --yes curl

#安装docker
RUN curl -fsSL get.docker.com -o get-docker.sh
RUN sh get-docker.sh
#安装docker-compose
RUN apt-get update
RUN apt-get install --yes docker-compose

#安装git
RUN apt-get install --yes git

#安装vim
RUN apt-get install --yes vim

#安装nodejs
RUN curl --silent --location https://deb.nodesource.com/setup_12.x | bash -
RUN apt-get install --yes nodejs
RUN apt-get install --yes build-essential

RUN apt-get install --yes libssl-dev

WORKDIR /
# 安装node依赖包
RUN npm i -g npm
RUN npm i -g pm2
RUN npm i -g fis3
RUN npm i -g fis-parser-babel-5.x
RUN npm i -g fis-parser-less-2.x
RUN npm i -g fis-optimizer-html-compress
RUN npm i -g fis3-ug
RUN npm i git+https://littleweb:2f4aa77bfdf979c85366ec44edd75d5f8309d9b3@github.com/littleweb/atweb.git
RUN npm i nodegit