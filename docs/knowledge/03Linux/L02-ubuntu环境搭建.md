---
sidebar_position: 2
---

# ubuntu环境搭建

## 1. MySQL

安装

```
// 更新系统软件源
sudo apt update
sudo apt upgrade -y

// 安装 MySQL Server
sudo apt install mysql-server -y

// 检查 MySQL 服务状态
sudo systemctl status mysql
// 如未启动，可手动启动：
sudo systemctl start mysql
sudo systemctl enable mysql

// 执行安全初始化
sudo mysql_secure_installation
是否启用密码强度校验插件 开发环境：N 生产环境：Y
设置 root 密码,建议设置一个强密码
是否删除匿名用户：N
是否禁止 root 远程登录：N
是否删除 test 数据库：Y
是否刷新权限表：Y
```

配置密码登录

```
// 登录
sudo mysql
mysql -u root -p

// 修改 root 登录方式
// 查看当前 root 登录方式，如果是 auth_socket，可切换为密码登录：
SELECT user, host, plugin FROM mysql.user WHERE user='root';
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'dawnstarpd';
FLUSH PRIVILEGES;

```

开启远程访问

```
sudo vim /etc/mysql/mysql.conf.d/mysqld.cnf
找到并修改：
bind-address = 0.0.0.0
// 重启
sudo systemctl restart mysql

CREATE USER 'root'@'%' IDENTIFIED BY 'dawnstarpd';
FLUSH PRIVILEGES;
```





## 2. Redis



## 3. JDK 



## 4. Nginx





