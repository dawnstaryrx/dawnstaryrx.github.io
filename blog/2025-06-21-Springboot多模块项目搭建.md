---
slug: Springboot多模块项目搭建
title: Springboot多模块项目搭建
authors: [yrx]
tags: [java]
---

在 IntelliJ IDEA 中搭建一个 **Spring Boot 多模块项目** 是企业级开发中常见的需求，能有效地实现模块解耦、职责划分。

<!-- truncate -->

在 IntelliJ IDEA 中搭建一个 **Spring Boot 多模块项目** 是企业级开发中常见的需求，能有效地实现模块解耦、职责划分。以下是从 0 开始搭建的完整步骤，分为 **结构设计、操作步骤、依赖管理** 和 **示例代码** 四部分：

------

## 一、项目结构设计（示例）

假设你要搭建一个简单的系统，分为三个模块：

```
springboot-multimodule/
├── pom.xml                   （父项目）
├── common/                   （通用模块：工具类、通用实体）
│   └── pom.xml
├── service/                  （服务模块：业务逻辑）
│   └── pom.xml
├── web/                      （Web模块：控制层，暴露接口）
│   └── pom.xml
```

------

## 二、使用 IntelliJ IDEA 创建步骤

### 1. 创建父工程（Parent Project）

- 打开 IDEA，选择 `New Project` → `Maven`
- 取消勾选 `Create from archetype`，点击 `Next`
- GroupId: `com.example`，ArtifactId: `springboot-multimodule`
- 勾选 `Create as root project`，点击 `Finish`
- 编辑父项目的 `pom.xml`：

```xml
<project xmlns="http://maven.apache.org/POM/4.0.0" ...>
    <modelVersion>4.0.0</modelVersion>
    <groupId>com.example</groupId>
    <artifactId>springboot-multimodule</artifactId>
    <version>1.0-SNAPSHOT</version>
    <packaging>pom</packaging>

    <modules>
        <module>common</module>
        <module>service</module>
        <module>web</module>
    </modules>

    <properties>
        <java.version>17</java.version>
        <spring.boot.version>3.2.0</spring.boot.version>
    </properties>

    <dependencyManagement>
        <dependencies>
            <dependency>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-dependencies</artifactId>
                <version>${spring.boot.version}</version>
                <type>pom</type>
                <scope>import</scope>
            </dependency>
        </dependencies>
    </dependencyManagement>

    <build>
        <pluginManagement>
            <plugins>
                <plugin>
                    <groupId>org.springframework.boot</groupId>
                    <artifactId>spring-boot-maven-plugin</artifactId>
                </plugin>
            </plugins>
        </pluginManagement>
    </build>
</project>
```

------

### 2. 添加模块

右键父项目 → `New` → `Module` → `Maven`，分别创建 `common`、`service`、`web` 三个子模块。每次创建时：

- GroupId 和 ArtifactId 填写对应名称，如 `com.example.common`
- `Parent` 设置为 `springboot-multimodule`

------

## 三、子模块配置

### 1. `common` 模块：通用模块

```xml
<project ...>
    <parent>
        <groupId>com.example</groupId>
        <artifactId>springboot-multimodule</artifactId>
        <version>1.0-SNAPSHOT</version>
    </parent>

    <artifactId>common</artifactId>

    <dependencies>
        <!-- 例如：通用的工具包、Lombok -->
        <dependency>
            <groupId>org.projectlombok</groupId>
            <artifactId>lombok</artifactId>
            <optional>true</optional>
        </dependency>
    </dependencies>
</project>
```

### 2. `service` 模块：业务模块

```xml
<project ...>
    <parent>
        <groupId>com.example</groupId>
        <artifactId>springboot-multimodule</artifactId>
        <version>1.0-SNAPSHOT</version>
    </parent>

    <artifactId>service</artifactId>

    <dependencies>
        <dependency>
            <groupId>com.example</groupId>
            <artifactId>common</artifactId>
            <version>1.0-SNAPSHOT</version>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter</artifactId>
        </dependency>
    </dependencies>
</project>
```

### 3. `web` 模块：Web 接口模块

```xml
<project ...>
    <parent>
        <groupId>com.example</groupId>
        <artifactId>springboot-multimodule</artifactId>
        <version>1.0-SNAPSHOT</version>
    </parent>

    <artifactId>web</artifactId>

    <dependencies>
        <dependency>
            <groupId>com.example</groupId>
            <artifactId>service</artifactId>
            <version>1.0-SNAPSHOT</version>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
    </dependencies>

    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
            </plugin>
        </plugins>
    </build>
</project>
```

------

## 四、添加启动类与示例

### `web` 模块的启动类：

```java
package com.example.web;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication(scanBasePackages = "com.example")
public class WebApplication {
    public static void main(String[] args) {
        SpringApplication.run(WebApplication.class, args);
    }
}
```

### 示例 Controller

`web` 模块下的 `HelloController.java`：

```java
@RestController
@RequestMapping("/api")
public class HelloController {

    @GetMapping("/hello")
    public String hello() {
        return "Hello from multi-module Spring Boot!";
    }
}
```

------

## 五、其他建议

- 使用 `@ComponentScan(basePackages = "com.example")` 或配置 `scanBasePackages` 来确保跨模块的 Bean 能够被扫描。
- 保证各模块的版本一致，统一由父项目控制。
- 可以将数据库相关代码放到 `service` 中，Controller 层只调用 Service 层。

