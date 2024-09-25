+++
title = '【SpringSecurity2】基于数据库实现认证和授权'
date = 2024-08-01T16:06:35+08:00
draft = false
tags = ["Java","SpringSecurity"]

+++

# 集成数据库实现认证和授权

## 流程

- 提供数据库表：单表
- 创建项目
  - 引入相关依赖，lombok web security mybatis plus
  - 配置MySQL
- 实体类
- Mapper Service
- Controller：提供登录接口
- 配置SpringSecurity

## 创建实体类

