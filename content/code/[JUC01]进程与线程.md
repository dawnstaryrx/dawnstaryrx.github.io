+++
title = "[JUC01]进程与线程"
date = "2024-07-24T08:15:56+08:00"

tags = ["Java"]
+++

# 一、进程与线程

## 1. 进程

- 进程由指令和数据组成，但这些指令要运行，数据要读写，就必须将指令加载至CPU，数据加载至内存。在指令运行过程中还需要用到磁盘、网络等设备。进程就是用来加载指令、管理内存、管理IO的。
- 当一个程序被运行，从磁盘加载这个程序的代码至内存，这时就开启了一个进程。
- 进程可以视为程序的一个实例。大部分程序可以同时运行多个实例进程，也有的程序只能启动一个进程实例。

## 2. 线程

- 一个进程之内可以分为一到多个线程。
- 一个线程就是一个指令流，将指令流中的一条条指令以一定的顺序交给CPU执行。
- Java中，线程作为最小调度单位，进程作为资源分配的最小单位。在Windows中进程是不活动的，只是作为线程的容器。

## 3. 二者对比

- 进程基本上是相互独立的，而线程存在于进程内，是进程的一个子集。
- 进程拥有共享的资源，例如内存空间等，供其内部的线程共享。
- 进程间通信较为复杂
  - 同一台计算机的进程通信称为 IPC （Inter-process communication）
  - 不同计算机之间的进程通信，需要通过网络，并遵守共同的协议，如HTTP
- 线程通信相对简单，因为它们共享进程内的内存，例如多个线程可以访问同一个共享变量
- 线程更轻量，线程上下文切换成本一般要比进程上下文切换低



# 二、并发与并行

- 将线程轮流使用CPU的做法称为并发。
- 并发（Concurrent）是同一时间应对（dealing with）多件事情的能力；
- 并行（Parallel）是同一时间动手做（doing）多件事情的能力。



# 三、同步与异步

从方法调用的角度来讲，如果

- 需要等待返回结果，才能继续运行就是同步；
- 不需要等待返回结果，就能继续运行就是异步。

注意：同步在多线程中还有另外一层意思，是让多个线程步调一致。
