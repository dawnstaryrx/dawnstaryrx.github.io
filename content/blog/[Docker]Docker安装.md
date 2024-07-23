+++
title = "【Docker】安装"
date = "2024-07-14T08:48:30+08:00"

tags = ["Docker",]
+++

# 一、什么是Docker

## 0. 形象化理解：Docker-预制菜

**传统**的应用程序开发和部署方式可以理解为在家里做一道菜（运行一个应用程序），但你需要提前准备好所有的食材和工具（安装所有的依赖软件和配置环境），而且每次做菜前都要确保这些东西都是新鲜和合适的。缺点很明显，耗时费力，而且每次环境可能都不一样，可能会导致做出来的菜（应用程序）效果不一致。

**Docker方式**：在你想要吃一道菜时，你不用自己准备食材和工具，而是可以从餐厅里直接购买一个预制菜盒（Docker 容器）。其中包含了所有需要的食材和工具（应用程序及其依赖），你只需要加热一下就可以享用（运行容器）。每次打开享用时，里面的东西都是一样的（环境一致性）。

## 1. 什么是Docker？

> Docker 是一个用于开发、发布和运行应用程序的开放平台。Docker 可让您将应用程序与基础架构分离，以便快速交付软件。借助 Docker，您可以像管理应用程序一样管理基础架构。通过利用 Docker 的发布、测试和部署代码方法，您可以显著减少编写代码和在生产中运行代码之间的延迟。

Docker是一个**开源的容器项目**，使用Go语言开发实现。官网：https://www.docker.com/

作为运行和管理容器的容器引擎，Docker让开发人员可以将**应用程序及其依赖**打包到一个可移植的**镜像**中，然后发布到任何流行的操作系统(Linux/win/mac os)的计算机上。

![image-20240714091707140](https://dawnstar-blog-1309734834.cos.ap-nanjing.myqcloud.com/img/2024%2F07%2F14%2F1c92331ebdecce45472860fa4b8af6ba-image-20240714091707140-31e031.png)

举个例子，假设你有一个需要运行在某种**特定配置**（特定版本的操作系统、依赖库等）上的 Web **应用程序**。**传统方式下**，你可能需要在每一台服务器上**手动配置环境**，确保它们的一致性。而**使用 Docker**，你只需在**开发环境中配置好应用程序**，然后将其**打包成一个容器镜像**，并可以在任何支持 Docker 的环境中**直接运行该镜像**。这样，就不再需要担心环境不一致的问题了。

## 2. 可以用Docker来做什么？

1. 开发环境的标准化：如上介绍，使用 Docker，开发团队可以在每个人的电脑上创建相同的开发环境，避免因为环境差异导致的问题；开发者可以快速搭建并切换不同的开发环境，而不需要在本地安装大量依赖。
2. 应用程序快速、一致地交付
3. 微服务架构：每个微服务可以打包到一个独立的容器中，方便管理和扩展。容器之间的通信可以通过 Docker 提供的网络功能来实现，简化了微服务之间的互操作。
4. 负载均衡：Docker 本身并不提供负载均衡的功能，但可以与其他工具和技术(Docker Swarm)结合使用来实现负载均衡。
5. ......

## 3. 容器与虚拟机

Docker是传统虚拟机的替代解决方案，越来越多的应用程序以容器的方式在开发、测试和生产环境中运行。

- **传统运维方式**：部署慢、成本高、资源浪费、难以扩展和迁移；
- **虚拟机运维方式**：
  - 采用**资源池化技术**，一台物理机的资源可分配到不同的虚拟机上；
  - 便于**弹性扩展**，增加物理机或虚拟机都很方便；
  - 容易**云化**，如将应用程序部署到云主机；
  - 但也存在一些**局限**，如每个虚拟机都运行一个完整的操作系统，当虚拟机数量增多时，操作系统本身**消耗的资源势必增多**。

**何为容器？**

- 容器是一种**轻量级虚拟化技术**，旨在为现有的虚拟机提供切实可行且经济高效的替代解决方案。

- 各个容器共享主机的操作系统，容器引擎将容器作为进程运行在主机上。
- 容器使用的是主机操作系统的内核，因此容器依赖主机操作系统的内核版本；虚拟机有自己的操作系统，且独立于主机操作系统，其操作系统内核可以与主机不同。
- 容器在主机操作系统的用户空间运行，并且与操作系统的其他进程相互隔离，启动时也不需要启动操作系统的内核空间。因此，与虚拟机相比，**容器启动快、开销少、迁移便捷**。
- 就隔离特性而言，**容器是应用层面的隔离**，虚拟机是物理资源层面的隔离。

## 4. Docker引擎

Docker引擎是目前主流的容器引擎。“引擎”（Engine）通常指的是一种软件组件或程序，负责处理特定类型的任务或实现特定的功能。例如：

- **数据库引擎**：负责数据存储、检索和管理的核心部分，如 MySQL 引擎。
- **游戏引擎**：提供创建和运行视频游戏所需的核心功能，如 Unity 或 Unreal 引擎。
- **Docker 引擎**：是 Docker 平台的核心组件，负责构建、运行和管理 Docker 容器。

Docker 引擎由以下几个主要部分**组成**：

- **Docker CLI**(command line interface)：表示Docker命令行接口，开发者可以在命令行中使用Docker相关指令与Docker守护进程进行交互，从而管理诸如image(镜像)、container(容器)、network(网络)和data volumes(数据卷)等实体。
- **REST API**：表示应用程序API接口，开发者通过该API接口可以与Docker的守护进程进行交互，从而指示后台进行相关操作。
- **Docker daemon**：表示Docker的服务端组件，他是Docker架构中运行在后台的一个守护进程，可以接收并处理来自命令行接口及API接口的指令，然后进行相应的后台操作。



![Docker引擎](https://dawnstar-blog-1309734834.cos.ap-nanjing.myqcloud.com/img/2024%2F07%2F14%2F03899473de721d54e542b7c772407c54-20201130150636046-46ea12.jpeg)

可以将 Docker 引擎比喻成一台自动化厨房设备：

- **Docker Daemon** 就像厨房设备的控制中心，负责接收和处理所有的烹饪任务。
- **Docker CLI** 就像是厨房设备的操作面板，用户可以通过按钮和旋钮下达指令。
- **REST API** 就像是一个远程控制器，允许用户通过手机应用或其他设备远程控制厨房设备。

当你想做一道菜（运行一个应用程序）时，你只需要通过操作面板（CLI）或远程控制器（API）下达指令，控制中心（Daemon）会自动完成所有的烹饪步骤（管理容器的生命周期），并通知你结果。

对于开发者而言，既可以使用编写好的脚本文件通过REST API来实现与Docker进程交互，又可以直接使用Docker相关指令通过命令行接口来与Docker进程交互，而其他一些Docker应用则是通过底层的API和CLI进行交互的。

## 5. Docker底层技术

- 命名空间(NameSpace)：是操作系统提供的一种隔离机制，用于隔离和管理系统资源的可见性。Docker使用命名空间机制为容器提供隔离的工作空间，运行容器时，Docker会为该容器创建一系列的命名空间。
- 控制组(Control Group)：Linux可以使用控制组设置进程使用CPU、内存和IO资源的限额。Linux上的Docker引擎正是依赖这种底层技术来限制容器使用的资源。
- 联合文件系统(Union File System)：是一种特殊的文件系统，它允许将多个不同的文件系统（通常是只读的）联合挂载到同一个目录下，形成一个逻辑上的单一文件系统视图。在 Linux 中，联合文件系统通常用于实现容器的轻量级虚拟化。联合文件系统是容器技术中重要的一环，通过它实现了容器的轻量级虚拟化和文件系统隔离，提升了容器的性能和管理效率。
- 容器格式(Container Format)：Docker引擎将命名空间、控制组和联合文件系统打包到一起所使用的就是容器格式。

# 二、安装Docker

Docker分为Docker Engine Community(Docker CE)社区版和Docker Enterprise企业版。社区版免费，非常适合个人开发者和小型团队的Docker入门使用。

Docker CE可用于多种操作系统平台和内部部署。适合安装Docker CE的桌面操作系统有Mac OS，Windows；适合安装Docker CE的服务器操作系统是Linux。

通常在Linux平台上安装Docker，以下介绍Ubuntu下的安装步骤。

## 1. 使用脚本安装

```
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh ./get-docker.sh --dry-run
```

## 2. 手动安装

在新主机上首次安装 Docker Engine-Community 之前，需要设置 Docker 仓库。之后，您可以从仓库安装和更新 Docker。

**设置仓库**

1、更新apt包索引

```
$ sudo apt-get update
```

2、添加 Docker 的官方 GPG 密钥

```
sudo apt-get install ca-certificates curl
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc
```

3、设置apt源

```
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt-get update
```

4、**安装Docker包**

- 最新的

```
sudo apt-get install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```

- 具体版本

要安装特定版本的 Docker Engine，请首先列出存储库中的可用版本：

```
# List the available versions:
apt-cache madison docker-ce | awk '{ print $3 }'

5:27.0.3-1~ubuntu.24.04~noble
5:27.0.2-1~ubuntu.24.04~noble
...
```

选择所需版本并安装：

```
VERSION_STRING=5:27.0.3-1~ubuntu.24.04~noble
sudo apt-get install docker-ce=$VERSION_STRING docker-ce-cli=$VERSION_STRING containerd.io docker-buildx-plugin docker-compose-plugin
```

5、通过运行映像来验证 Docker Engine 安装是否成功 `hello-world`。

```
sudo docker run hello-world
```

此命令下载测试映像并在容器中运行。容器运行时，它会打印一条确认消息并退出。

## 3. 清华源安装

https://mirrors.tuna.tsinghua.edu.cn/help/docker-ce/

# 三、Docker命令行使用



