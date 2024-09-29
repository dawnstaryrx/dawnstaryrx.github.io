+++
title = "[Docker2]快速入门"
date = "2024-08-29T08:48:30+08:00"

tags = ["Docker",]
+++

docker镜像https://dockerhub.icu/

centos ip: 192.168.80.129

# 部署MySQL

拉取MySQL镜像

```
docker pull dockerhub.icu/library/mysql
```

创建MySQL容器

```
docker run -d \
    --name mysql \
    -p 3306:3306 \
    -e TZ=Asia/Shanghai \
    -e MYSQL_ROOT_PASSWORD=dfjb \
    mysql
```

启动MySQL

```
docker start mysql
```

# 命令解读

```
docker run -d \
创建并运行一个容器，-d是让容器在后台运行
    --name mysql \
    给容器起名，必须唯一
    -p 3306:3306 \
    端口映射，
    -e TZ=Asia/Shanghai \
    设置环境变量，时区
    -e MYSQL_ROOT_PASSWORD=dfjb \
    设置环境变量
    mysql
    指定运行镜像的名字，完整写法[repository]:[tag]，如mysql:5.7，默认latest
```



