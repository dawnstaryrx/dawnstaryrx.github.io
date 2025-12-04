---
slug: SpringbootVue项目部署
title: Springboot+Vue项目部署
authors: [yrx]
tags: [linux]
---

在 IntelliJ IDEA 中搭建一个 **Spring Boot 多模块项目** 是企业级开发中常见的需求，能有效地实现模块解耦、职责划分。

<!-- truncate -->

> 在这篇文章，我将从头把一个Springboot Vue3项目打包、部署到腾讯云服务器，操作系统是Ubuntu。 
> 在这个过程中，需要安装tmux（用于终端复用，也就是相当于多开几个屏），Vim（编辑器），JDK17，Nginx（前端部署在Nginx服务器上），MySQL，Redis（缓存数据库）。
> 其中会用到两个软件，puTTY（用于登录云服务器），FileZilla（用于从当前电脑向云服务器上传文件）。

## 1 安装tmux,Vim

```
sudo apt update
sudo apt install tmux
sudo apt install vim  
```

常用命令可以参考：

## 2 安装JDK17

```
apt-cache search openjdk               // 查找apt中JDK版本
sudo apt-get install openjdk-17-jdk    // 安装JDK17
java --version                         // 检查JDK是否安装成功
sudo update-alternatives --config java // 查看JDK安装到什么地方，配置环境时使用


//-------------------------------------------
// 以下可选，用于设置环境变量
sudo vim /etc/profile
// 在/etc/profile文件的末尾添加以下内容
JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64      // 根据上面查看到的路径
PATH=$PATH:$HOME/bin:$JAVA_HOME/bin
export JAVA_HOME
export JRE_HOME
export PATH
```

## 3 安装Redis（没使用到则跳过）

```
sudo apt install redis-server           // 安装
sudo systemctl status redis-server      // 检查服务的状态  active(running)
```

## 4 安装MySQL

```
sudo apt install mysql-server          // 安装
mysql --version                        // 确定mysql版本为8.0.xx
```

![img](https://dawnstar-blog-1309734834.cos.ap-nanjing.myqcloud.com/img/2024%2F07%2F29%2F7eb9b5686e5a84f6920854a1d8718fcd-v2-a429f68ad30443b33dcf46a49fdfde4b_1440w-4fcf5c.png)

MySQL版本8.0.36

```
sudo passwd                           // 设置密码
```

![img](https://dawnstar-blog-1309734834.cos.ap-nanjing.myqcloud.com/img/2024%2F07%2F29%2F6c96e80cc9610464a63e3173ac571a06-v2-f219646b1d8725cb09005598ff5fdbf5_1440w-c34bd2.png)

设置密码

![img](https://dawnstar-blog-1309734834.cos.ap-nanjing.myqcloud.com/img/2024%2F07%2F29%2Fe47acd4c1d9057bf3726c3c9340543c2-v2-c99b13c85b066cfe7d0ba437f83a180d_1440w-337391.png)

使用密码登录，发现权限不足

解决办法：

```
$ sudo mysql -u root # I had to use "sudo" since is new installation

mysql> USE mysql;
mysql> UPDATE user SET plugin='mysql_native_password' WHERE User='root';
mysql> FLUSH PRIVILEGES;
mysql> alter user 'root'@'localhost' identified with mysql_native_password by '密码';
mysql> exit;

$ service mysql restart
```

![img](https://dawnstar-blog-1309734834.cos.ap-nanjing.myqcloud.com/img/2024%2F07%2F29%2F00e53932585bc103096d6820091bbaa4-v2-5486c204c79012306f6416321da15672_1440w-47851f.png)

成功解决

## 5 安装Nginx

```
sudo apt install nginx             // 安装
sudo systemctl status nginx        // 检测是否在运行
```

nginx部分命令

```
systemctl start nginx              // 启动
systemctl stop nginx               // 停止
systemctl quit nginx               // 退出
systemctl restart nginx            // 重启
systemctl reload nginx             // 重新加载 当你修改配置文件后可以使用此命令，使修改生效
systemctl status nginx             // 查看服务状态
```

![img](https://dawnstar-blog-1309734834.cos.ap-nanjing.myqcloud.com/img/2024%2F07%2F29%2Fd6d45caa86223c9fff08f3a650d2e115-v2-b9ff3c8ef1e47c6386161c67ef87412c_1440w-f7fb88.png)

输入IP，可看到此页面，说明安装成功

该HTML页面在服务器的/var/www/html目录下，之后会用到。

![img](https://dawnstar-blog-1309734834.cos.ap-nanjing.myqcloud.com/img/2024%2F07%2F29%2Fa383a672b9879414bf02faa297819539-v2-31720aadfb363d3182d6a466867d1f0a_1440w-f87278.png)

源文件位置

现在，我们已经安装好所有环境，准备开始部署项目。

## 6 部署后端

点击package完成打包。打包之前记得修改需要修改的配置信息。

![img](https://dawnstar-blog-1309734834.cos.ap-nanjing.myqcloud.com/img/2024%2F07%2F29%2F9e4658f866c0402d3371926fd63d01bb-v2-fbe17852b10b0a8c6dbbd6e8dec3ca1e_1440w-8c19c2.png)

添加图片注释，不超过 140 字（可选）

![img](https://dawnstar-blog-1309734834.cos.ap-nanjing.myqcloud.com/img/2024%2F07%2F29%2F7f70cc9841faf51b61c9fe7a1f5c6d6b-v2-da013d5c63a0f6948db9b54dd9093cfa_1440w-74ee7b.png)

添加图片注释，不超过 140 字（可选）

![img](https://dawnstar-blog-1309734834.cos.ap-nanjing.myqcloud.com/img/2024%2F07%2F29%2F17bc82134ba9f113e84f53ad2791709c-v2-317d8b1a9029b4d937b8e8f0abcd0dc3_1440w-f48358.png)

添加图片注释，不超过 140 字（可选）

使用FileZilla将得到的Jar包传到服务器。

![img](https://dawnstar-blog-1309734834.cos.ap-nanjing.myqcloud.com/img/2024%2F07%2F29%2Fa038efd94ba1d9768f83698326fd257a-v2-39ec9309ca8490683d8fc82f86c0c652_1440w-8e4b94.png)

先连接服务器，找到文件夹，从左面拖到右面即可

运行后端：

```
java -jar  xxxxx.jar
```

![img](https://dawnstar-blog-1309734834.cos.ap-nanjing.myqcloud.com/img/2024%2F07%2F29%2Fe24d8e93f6364d1180da34c519fa7f5e-v2-0da9e0358505e39bd7e7edeff23f637d_1440w-a10ff7.png)

后端启动成功

## 7 数据库建表

### 7.1 IDEA生成数据库脚本

![img](https://dawnstar-blog-1309734834.cos.ap-nanjing.myqcloud.com/img/2024%2F07%2F29%2F5c1aa7d1fffda04b160337a5215c31ea-v2-9c3894e84381323f022959af89086077_1440w-e06fc8.png)

依次点击

![img](https://dawnstar-blog-1309734834.cos.ap-nanjing.myqcloud.com/img/2024%2F07%2F29%2F89975fa6b14727e77f605c7f122284f6-v2-7ebd7e46cc79c2ec750f83fcda7fd14d_1440w-df7169.png)

右上角复制

### 7.2 服务器建库，运行脚本

```
mysql -u root -p               // 连接数据库
    
create database repair;
use dawnblog;
// 执行数据库脚本
// 粘贴，回车
exit;                          
```

## 8 部署前端

### 8.1 打包

我们使用Vue UI，任务->build，完成前端的打包。

![img](https://dawnstar-blog-1309734834.cos.ap-nanjing.myqcloud.com/img/2024%2F07%2F29%2F3e22305897d5a789f02c36e4ab6dabf2-v2-ac1db3d2ea2be6a1d7aac988b3923980_1440w-ead0f4.png)

打包

![img](https://dawnstar-blog-1309734834.cos.ap-nanjing.myqcloud.com/img/2024%2F07%2F29%2Fae89681d02d2812a02d3a9011ee1fee9-v2-fc01672d2f5e2053d4def2dd3cb563f2_1440w-306c95.png)

打包后的文件，在dist目录下

### 8.2 上传

![img](https://dawnstar-blog-1309734834.cos.ap-nanjing.myqcloud.com/img/2024%2F07%2F29%2F46f42a0f86c6e108f44e9c885e445203-v2-d9341c8208ff3acf1edc23d1c2f7fcd3_1440w-55e749.png)

将整个dist文件夹上传到服务器

### 8.3 移动文件夹位置

```
sudo mv ~/dist /var/www                    // 移到/var/www目录下
sudo rm -rf /var/www/html                  // 删除原来的html文件夹
sudo mv /var/www/dist /var/www/html        // 改文件名
systemctl restart nginx                    // 重启nginx
```

![img](https://dawnstar-blog-1309734834.cos.ap-nanjing.myqcloud.com/img/2024%2F07%2F29%2F11b506e75710e20e50303f09c6c30226-v2-23c4067ec91a43a7f92a6b466d79ab0f_1440w-aaed3f.png)

此时访问，可能会出现404

解决办法：

```
cd /etc/nginx/sites-enabled/
sudo vim default

try_files  $uri $uri/ /index.html;

// -----------------------------------
location /api {
    rewrite ^/api/(.*)$ /$1 break;
    proxy_pass http://111.111.11.111:8080;
}
```

![img](https://dawnstar-blog-1309734834.cos.ap-nanjing.myqcloud.com/img/2024%2F07%2F29%2F6d6f3a5bcb1473915c38720c8cb5b4b9-v2-767ba74a8cc17a845c832de0d0b0c653_1440w-8f81a0.png)

```
#注释掉红色箭头所指的一行，添加蓝色箭头一行
systemctl reload nginx           // 重新加载配置
```

![img](https://dawnstar-blog-1309734834.cos.ap-nanjing.myqcloud.com/img/2024%2F07%2F29%2Fda2077703bd346392fa03981e3bc0377-v2-e5c649926d4107f0eb9b971e049609cf_1440w-47ef6c.png)

添加图片注释，不超过 140 字（可选）

部署成功！
