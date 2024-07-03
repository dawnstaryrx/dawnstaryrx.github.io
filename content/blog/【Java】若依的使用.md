+++
title = "【Java】若依的使用"
date = "2024-06-27T20:09:05+08:00"
tags = ["Java",]

+++

# 一、若依搭建

前后端分离版本，前端使用Vue3，后端使用Springboot。  
软件环境：JDK11，MySQL8，Redis，Maven，Node  
后端地址：https://github.com/yangzongzhuan/RuoYi-Vue  
前端地址：https://github.com/yangzongzhuan/RuoYi-Vue3 

## 后端运行

1. Git克隆并初始化项目，`git clone xxx`；
2. MySQL导入与配置，SQL脚本在./sql下，创建数据库并运行脚本；密码在`ruoyi/admin/src/main/resources/application-druid.yml`配置文件中修改；
3. 启动Redis；
4. 运行后端项目。

## 前端运行

1. Git克隆并初始化项目；
2. 安装依赖，`npm install`；
3. 运行前端项目，`npm run dev`。

# 二、功能详解

## 1. 系统管理

### 1.1 权限控制

RBAC(基于角色的访问控制)是一种广泛使用的访问控制模型，通过**角色**来分配和管理**用户**的菜单权限。  

![image-20240630090954916](https://dawnstar-blog-1309734834.cos.ap-nanjing.myqcloud.com/img/2024%2F06%2F30%2F1198480ed4f7113505e402d124a0d9e7-image-20240630090954916-02ae2b.png)

![image-20240630091124215](https://dawnstar-blog-1309734834.cos.ap-nanjing.myqcloud.com/img/2024%2F06%2F30%2Fbaf2166ef449e66e4a49b94c13243be2-image-20240630091124215-71d88d.png)

### 1.2 数据字典

- 用于维护系统中常见的静态数据，如：性别，状态。
- 功能包括：字典类型管理，字典数据管理。

![image-20240630151653586](https://dawnstar-blog-1309734834.cos.ap-nanjing.myqcloud.com/img/2024%2F06%2F30%2F7f6c75c6554d88ab01d2c46ccea6f465-image-20240630151653586-eed53e.png)

### 1.3 其他功能

- 参数设置：对系统中的参数进行动态维护；（login.vue 97行 注册开关）
- 通知公告：促进组织内部进行信息传递；（自己编写页面，如发送邮件）
- 日志管理：轻松追踪用户行为和系统运行状况。

## 2. 系统监控

### 2.1 监控相关

帮助开发者和运维快速了解应用程序的性能状态。

- 在线用户：数据来自于Redis缓存
- 缓存列表
- 缓存监控
- 服务监控
- 数据监控：durid账号 密码（ruoyi 123456）

### 2.2 定时任务

提供方便友好的Web界面，实现动态管理任务。

1. quartz模块task包下创建任务类；
2. 添加任务规则；
3. 启动任务。

## 3. 系统工具

### 3.1 表单构建

https://jakhuang.github.io/form-generator/#/

### 3.2 代码生成

- 自动生成前后端CRUD代码；
- 提供三种生成模板：单表，树表（层级关系，能展开折叠，呈现父子关系，如部门表），主子表（一对多，如菜品表与口味表）。

# 四、项目结构

