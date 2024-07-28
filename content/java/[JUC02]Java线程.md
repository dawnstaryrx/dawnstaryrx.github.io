+++
title = "【JUC02】Java线程"
date = "2024-07-24T09:31:04+08:00"
tags = ["Java",]

+++

# 一、创建和运行线程

Java程序在启动时，都已经创建了一个主线程。

## 1. 方法一：直接使用Thread

```java
// 创建线程对象，指定名字t1
Thread t = new Thread("t1"){
    public void run(){
        // 要执行的任务
        log.debug("hello");
    }
};
// 启动线程
t.start();
log.debug("hello main");
```

结果

![image-20240725075318286](https://dawnstar-blog-1309734834.cos.ap-nanjing.myqcloud.com/img/2024%2F07%2F25%2F81ee6e030a10ea2c442aa50dfbc0f8c7-image-20240725075318286-801398.png)

## 2. 方法二：使用Runnable配合Thread

把【线程】和【任务】（要执行的代码）分开

- Thread代表线程
- Runnable代表可运行的任务

```java
Runnable runnable = new Runnable() {
    @Override
    public void run() {
        // 要执行的任务
        log.debug("running");
    }
};
// 创建线程对象
Thread t1 = new Thread(runnable, "t1");
// 启动线程
t1.start();
```

## 3. lambda简化

Java8以后使用lambda精简代码

```java
Runnable task2 = () -> log.debug("task2");
Thread t2 = new Thread(task2, "t2");
t2.start();
```

## 4. Thread与Runnable的关系

- 方法一是把线程和任务合并在了一起，方法二是把线程和任务分开了
- 用Runnable更容易与线程池等高级API配合
- 用Runnable让任务类脱离了Thread继承体系，更灵活

## 5. 方法三：FutureTask配合Thread

FutureTask能够接收Callable类型的参数，用来处理有返回结果的情况

```java
// 创建任务对象
FutureTask<Integer> task3 = new FutureTask<>(() -> {
    log.debug("task3");
    return 100;
});

new Thread(task3, "t3").start();
// 主线程阻塞，同步等待task执行完毕的结果
Integer result = task3.get();
log.debug("result: {}", result);
```

# 二、观察多个线程同时运行

- 交替执行
- 谁先谁后，不由我们控制

```java
new Thread(() -> {
    while (true){
        log.debug("running");
    }
}, "t1").start();

new Thread(() -> {
    while (true){
        log.debug("running");
    }
}, "t2").start();
```

# 三、查看进程线程的方法

## 1. Windows

- Windows管理器
- tasklist 查看进程
- taskkill 杀死进程

## 2. Linux

- ps -fe 查看所有进程
- ps -fT -p \<PID> 查看某个进程PID的所有线程
- kill 杀死进程
- top 按大写H切换是否显示线程
- top -H -p \<PID>  查看某个进程PID的所有线程

## 3. Java

- jps命令 查看所有Java进程
- jstack \<PID> 查看某个Java进程的所有线程状态
- jconsole 查看某个Java进程中线程的运行情况 图形界面

# 四、线程运行的原理

## 1. 栈与栈帧

Java Virtual Machine Stacks (Java 虚拟机栈)

JVM中由堆、栈、方法去所组成。栈内存是给线程用的，每个线程启动后，虚拟机就会为其分配一块栈内存。

- 每个栈由多个栈帧Frame组成，对应着每次方法调用时所占用的内存
- 每个线程只能有一个活动栈帧，对应着当前正在执行的那个方法

## 2. 线程上下文切换 Thread Context Switch

因为以下一些原因导致CPU不再执行当前的线程，转而执行另一个线程的代码

- 线程的CPU时间片用完
- 垃圾回收
- 有更高优先级的线程需要运行
- 线程自己调用了sleep/yield/wait/join/park/synchronized/lock等方法程序

当Context Switch发生时，需要由操作系统保存当前线程的状态，并恢复另一个线程的状态，Java中对应的概念就是程序计数器，它的作用是记住下一条JVM指令的执行地址，是线程私有的

- 状态包括程序计数器、虚拟机栈中每个栈帧的信息，如局部变量、操作数栈、返回地址等
- Context Switch频繁发生会影响性能

# 五、常见方法

## 1. 常见方法

| 方法名           | static | 功能说明                                                     |                             注意                             |
| ---------------- | ------ | ------------------------------------------------------------ | :----------------------------------------------------------: |
| start()          |        | 启动一个新线程，在新的线程运行 run 方法中的代码              | start 方法只是让线程进入就绪，里面代码不一定立刻 运行（CPU 的时间片还没分给它）。每个线程对象的 start方法只能调用一次，如果调用了多次会出现 IllegalThreadStateException |
| run()            |        | 新线程启动后会调用的方法                                     | 如果在构造 Thread 对象时传递了 Runnable 参数，则线程启动后会调用 Runnable 中的 run 方法，否则默认不执行任何操作。但可以创建 Thread 的子类对象， 来覆盖默认行为 |
| join()           |        | 等待线程运行结束                                             |                                                              |
| join(long n)     |        | 等待线程运行结 束,最多等待 n  毫秒                           |                                                              |
| getId()          |        | 获取线程长整型的 id                                          |                           id 唯一                            |
| getName()        |        | 获取线程名                                                   |                                                              |
| setName(String)  |        | 修改线程名                                                   |                                                              |
| getPriority()    |        | 获取线程优先级                                               |                                                              |
| setPriority(int) |        | 修改线程优先级                                               | java中规定线程优先级是1~10 的整数，较大的优先级 能提高该线程被 CPU 调度的机率 |
| getState()       |        | 获取线程状态                                                 | Java 中线程状态是用 6 个 enum 表示，分别为： NEW, RUNNABLE, BLOCKED, WAITING,  TIMED_WAITING, TERMINATED |
| isInterrupted()  |        | 判断是否被打 断， 不会清除打断标记                           |                                                              |
| isAlive()        |        | 线程是否存活（还没有运行完毕）                               |                                                              |
| interrupt()      |        | 打断线程                                                     | 如果被打断线程正在 sleep，wait，join 会导致被打断 的线程抛出 InterruptedException，并清除打断标记 ；如果打断的正在运行的线程，则会设置打断标记 ；park 的线程被打断，也会设置打断标记 |
| interrupted()    | static | 判断当前线程是否被打断                                       |                        会清除打断标记                        |
| currentThread()  | static | 获取当前正在执                                               |                                                              |
| sleep(long n)    | static | 让当前执行的线 程休眠n毫秒， 休眠时让出 cpu  的时间片给其它 线程 |                                                              |
| yield()          | static | 提示线程调度器 让出当前线程对CPU的使用 主要是为了测试和调试  |                                                              |

## 2. sleep 与 yield

sleep

- 调用sleep会让当前线程从Running进入Timed Waiting状态
- 其它线程可以使用interrupt方法打断正在睡眠的线程，这时sleep方法会抛出InterruptedException
- 睡眠结束后的线程未必会立刻得到执行
- 建议用TimeUnit的sleep代替Thread的sleep来获得更好的可读性

yield

- 调用yield会让当前线程从Running进入Runnable状态，然后调度执行其它同优先级的线程。如果这时没有同优先级的线程，那么不能保证让当前线程暂停的效果
- 具体的实现依赖于操作系统的任务调度器
