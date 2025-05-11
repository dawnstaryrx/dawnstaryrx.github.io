+++
title = "[Docker3]基础"
date = "2024-08-29T08:48:30+08:00"

tags = ["Docker",]
+++

# 一、常见命令

## 1. 镜像命令

- `docker pull`：从镜像仓库拉取到本地
- `docker push`：docker镜像推送到镜像仓库
- `docker images`  ：查看本地镜像
- `docker rmi`：删除镜像
- `docker build`：dockerfile自定义镜像
- `docker save `：保存镜像到本地变成一个压缩文件
- `docker load`：压缩文件加载

## 2. 容器命令

- `docker run`：创建并运行容器
- `docker stop`：停止容器
- `docker start`：运行容器
- `docker ps`：查看当前容器的运行状态
- `docker rm`：删除容器
- `docker logs`：查看容器日志
- `docker exec`：进入到容器内部

## 3. 案例

拉取nginx镜像，创建并运行nginx容器

```
// 拉取镜像
docker pull nginx
// 查看镜像列表
docker images
// 保存镜像到本地
docker save -o nginx.tar nginx:latest
// 删除
docker rmi nginx:latest
// 加载
docker load -i nginx.tar
// 创建并运行容器
docker run -d --name nginx -p 80:80 nginx
// 查看容器
docker ps
// 停止
docker stop
// 查看
docker ps -a
// 启动
docker start nginx
// 查看日志
docker logs
// 进入内部
docker exec -it nginx bash
// 退出
exit
```



# 二、数据卷

数据卷volume是一个虚拟目录，是**容器内目录**与**宿主机目录**之间映射的桥梁。  

/var/lib/docker/volumes/...创建数据卷。 

`docker volume --help`   

- `docker volume create`：创建数据卷
- `docker volume ls`：查看所有数据卷
- `docker volume rm`：删除指定数据卷
- `docker volume inspect`：查看某个数据卷的详情
- `docker volume prune`：清除数据卷

## 1. 案例1：利用nginx部署静态资源

- 在docker run 命令执行时，使用 `-v 数据卷:容器内目录`可以完成数据卷的挂载。
- 当创建容器时，如果挂载了数据卷且数据卷不存在，会自动创建数据卷。

```
docker run -d --name nginx -p 80:80 -v html:/usr/share/nginx/html  nginx
docker volume ls
docker volume inspect html
```

## 2.案例2：MySQL容器的数据挂载

- 查看mysql容器，判断是否有数据卷挂载
- 基于宿主机目录实现MySQL数据目录、配置文件、初始化脚本的挂载
  - /root/mysql/data到容器内/var/lib/mysql
  - /root/mysql/init到容器内/docker-entrypoint-initdb.d，携带SQL脚本
  - /root/mysql/conf到容器内/etc/mysql/conf.d，携带配置文件

```
// 查看容器详情
docker inspect
```

注：

- 在执行`docker run`命令时，使用`-v 本地目录:容器内目录` 可以完成本地目录挂载
- 本地目录必须以"/"或"./"开头，如果直接以名称开头，会被识别为数据卷而非本地目录
  - `-v mysql:/var/lib/mysql` 会被识别为一个数据卷叫mysql
  - `-v ./mysql:/var/lib/mysql `会被识别为当前目录下的mysql目录

```
docker run -d \
	--name mysql \
	-p 3306:3306 \
	-e TZ=Asia/Shanghai \
	-e MYSQL_ROOT_PASSWORD=dfjb \
	-v /root/mysql/data:/var/lib/mysql \
	-v /root/mysql/init:/docker-entrypoint-initdb.d \
	-v /root/mysql/conf:/etc/mysql/conf.d \
	mysql:8.0.31
```



# 自定义镜像

Dockerfile就是一个文本文件，其中包含一个个的指令，用指令来说明要执行什么操作来构建镜像。将来Docker可以根据Dockerfile帮我们构建镜像。常见指令如下：

- `FROM`：指定基础镜像，如FROM centos:6
- `ENV`：设置环境变量，可在后面指令使用，如ENV key value
- `COPY`：拷贝本地文件到镜像的指定目录，如COPY .jrell.tar.gz /tmp
- `RUN`：执行Linux的Shell命令，一般是安装过程的命令
- `EXPOSE`：指定容器运行时监听的端口，是给镜像使用者看的，如EXPOSE 8080
- `ENTRYPOINT`：镜像中应用的启动命令，容器运行时调用，如ENTRYPOINT java -jar xx.jar

当写好了Dockerfile，可以利用下面命令来构建镜像：

```
docker build -t myImage:1.0 .
```

- `-t`是给构建的镜像命名
- `.`指定Dockerfile所在的目录

```
# 基础镜像
FROM openjdk:11.0-jre-buster
# 设定时区
ENV TZ=Asia/Shanghai
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone
# 拷贝jar包
COPY docker-demo.jar /app.jar
# 入口
ENTRYPOINT ["java", "-jar", "/app.jar"]
```



```
docker images
docker run -d --name docker-demo -p 8080:8080 docker-demo:1.0
docker ps
```



# 网络

默认情况下，所有容器都是以bridge方式连接到Docker的一个虚拟网桥上。

172.17.0.1/16

加入自定义网络的容器才可以通过容器名互相访问，Docker的网络操作命令如下：

- `docker network create`：创建一个网络
- `docker network ls`：查看所有网络
- `docker network rm`：删除指定网络
- `docker network prune`：清除未使用的网络
- `docker network connect`：使指定容器连接加入某网络
- `docker network disconnect`：使指定容器连接离开某网络
- `docker network inspect`：查看网络详细信息

```
docker network ls
docker network create dawn
docker netword connect dawn mysql
docker inspect mysql

docker run -d --name dd -p 8080:8080 --network dawn docker
```



