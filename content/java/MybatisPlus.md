+++
title = "MybtiasPlus快速入门"
date = "2024-08-29T08:48:30+08:00"

tags = []
+++

# 一、快速入门

MyBatisPlus使用的基本流程是什么？

1. 引入起步依赖
2. 自定义Mapper基础BaseMapper
3. 在实体类上添加注解声明 表信息
4. 在application.yml中根据需要添加配置



## 1. 引入依赖

Springboot2

```
<dependency>
    <groupId>com.baomidou</groupId>
    <artifactId>mybatis-plus-boot-starter</artifactId>
    <version>3.5.7</version>
</dependency>
```

Springboot3

```
<dependency>
    <groupId>com.baomidou</groupId>
    <artifactId>mybatis-plus-spring-boot3-starter</artifactId>
    <version>3.5.7</version>
</dependency>
```

## 2. 定义Mapper

自定义的Mapper继承MybatisPlus提供的BaseMapper接口

```
public interface UserMapper extends BaseMapper<User> {
}
```

## 3. 常见注解

MybatisPlus是如何获取实现CRUD的数据库表信息的？

**MyBatisPlus**通过扫描实体类，并基于反射获取实体类信息作为数据库表信息。

- 类名驼峰转下划线作为表名
- 名为id的字段作为主键
- 变量名驼峰转下划线作为表的字段名



MybatisPlus中比较常用的几个注解如下：

- **@TableName**：用来指定表名
- **@TableId**：用来指定表中的主键字段信息
- **@TableField**：用来指定表中的普通字段信息



> IdType枚举：
>
> •AUTO：数据库自增长
>
> •INPUT：通过set方法自行输入
>
> •ASSIGN_ID：分配 ID，接口IdentifierGenerator的方法nextId来生成id，默认实现类为DefaultIdentifierGenerator雪花算法
> 
>
> 使用@TableField的常见场景：
>
> •成员变量名与数据库字段名不一致
>
> •成员变量名以is开头，且是布尔值
>
> •成员变量名与数据库关键字冲突
>
> •成员变量不是数据库字段

## 4. 常见配置

**MyBatisPlus**的配置项继承了MyBatis原生配置和一些自己特有的配置。例如：

```
mybatis-plus:
  type-aliases-package: "com.itheima.mp.domain.po"  # 别名扫描包
  mapper-locations: "classpath*:/mapper/**/*.xml"  # mapper.xml文件地址，默认值
  configuration:
    map-underscore-to-camel-case: true            # 是否开启下划线和驼峰的映射
    cache-enabled: false                          # 是否开启二级缓存
  global-config:
    db-config:
      id-type: assign_id                          # id为雪花算法生成
      update-strategy: not_null                   # 更新策略，只更新非空字段
```

# 二、核心功能

## 1. 条件构造器

条件构造器的用法：

- QueryWrapper和LambdaQueryWrapper通常用来构建select、delete、update的where条件部分
- UpdateWrapper和LambdaUpdateWrapper通常只有在set语句比较特殊才使用
- 尽量使用LambdaQueryWrapper和LambdaUpdateWrapper，避免硬编码

## 2. 自定义SQL

我们可以利用MyBatisPlus的Wrapper来构建复杂的Where条件，然后自己定义SQL语句中剩下的部分。

①基于Wrapper构建where条件

```
List<Long> ids = List.of(1L, 2L, 4L);
int amount = 200;
// 1.构建条件
LambdaQueryWrapper<User> wrapper = new LambdaQueryWrapper<User>().in(User::getId, ids);
// 2.自定义SQL方法调用
userMapper.updateBalanceByIds(wrapper, amount);
```

②在mapper方法参数中用Param注解声明wrapper变量名称，必须是ew

```
void updateBalanceByIds(@Param("ew") LambdaQueryWrapper<User> wrapper, @Param("amount") int amount);
```

③自定义SQL，并使用Wrapper条件

```
<update id="updateBalanceByIds">
	UPDATE tb_user SET balance = balance - #{amount} ${ew.customSqlSegment}</update>
```



## 3. Service接口

1. 定义IUserService接口
2. 创建实现类impl.UserServiceImpl，实现IUserService
3. IUserService继承IService
4. UserServiceImpl继承

```
public interface IUserService extends IService<User> {}
public class UserServiceImpl extends ServiceImpl<UserMapper, User> implements IUserService {}
```



















