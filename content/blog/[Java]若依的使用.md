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

## 1. 后端部分

### 后端结构

- ruoyi-admin：后台服务，包含通用功能的controller和启动类；
- ruoyi-common：通用工具。
  - annotation自定义注解，config全局配置，constant通用常量，**core核心控制**，enums通用枚举，**exception通用异常**，filter过滤器处理，**utils通用工具类**，xss自定义xss校验。
- ruoyi-framework：框架核心。
  - aspectj自定义AOP，**config系统配置**，datasource多数据源，interceptor拦截器处理，manager异步处理，**security权限控制，web前端控制**。
- ruoyi-generator：代码生成（可移除）。
- ruoyi-quartz：定时任务（可移除）。
- ruoyi-system：系统模块。domain，mapper，service。
- ruoyi-ui。



### 项目中的配置

- 位于ruoyi-admin的resources目录下；
- i18n：国际化支持；
- META-INF：项目的元信息（描述数据的数据），无需修改。
- mybatis：mabatis相关的配置；
- application.yml：项目中的核心配置；
- application-druid.yml：数据库连接配置。
- banner.txt：项目启动，打印信息配置。
- logback.xml：日志相关配置。



### 模块依赖关系

![image-20240704150410364](https://dawnstar-blog-1309734834.cos.ap-nanjing.myqcloud.com/img/2024%2F07%2F04%2F598933c142267f43916484e966d2060d-image-20240704150410364-38d879.png)



## 2. 前端部分

![image-20240704151112938](https://dawnstar-blog-1309734834.cos.ap-nanjing.myqcloud.com/img/2024%2F07%2F04%2F8215e1eadb677f16a0d863aaef177091-image-20240704151112938-d69dbd.png)



## 3. 表结构

![image-20240704151153558](https://dawnstar-blog-1309734834.cos.ap-nanjing.myqcloud.com/img/2024%2F07%2F04%2Ff50b0c635383c4b7c5c3e4b21d24fec7-image-20240704151153558-294909.png)

# 五、二次开发

## 1. 新建业务模块

- 若依框架修改器：一键修改RuoYi框架包名、项目名的工具。  
- 地址：https://gitee.com/lpf_project/RuoYi-MT/releases

![image-20240706095459079](https://dawnstar-blog-1309734834.cos.ap-nanjing.myqcloud.com/img/2024%2F07%2F06%2Fcf70b312722b362c23ba721886752a4e-image-20240706095459079-8f239f.png)

新建sky-merchant业务模块  

1. 新建子模块，需引入核心模块（复制粘贴入口模块中的即可）
2. 父工程版本锁定
3. 服务入口模块sky-admin添加依赖sky-merchant



## 2. 菜品管理

- 利用若依代码生成器（主子表模板），生成菜品管理的前后端代码。

![image-20240706102111958](https://dawnstar-blog-1309734834.cos.ap-nanjing.myqcloud.com/img/2024%2F07%2F06%2F48a5b231340e3738bcde2d12ffd69dd9-image-20240706102111958-dfc7bc.png)

- 配置代码生成信息。
- 下载代码，导入项目。

