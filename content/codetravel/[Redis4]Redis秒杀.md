+++
title = '[Redis4]Redis秒杀'
date = 2024-08-15T21:12:26+08:00
draft = false
tag = ['Redis']

+++

# 一、全局唯一ID

使用自增ID存在的问题：

- id的规律性太明显；
- 受表单数据量的限制。

全局ID生成器，是一种在分布式系统下用来生成全局唯一ID的工具，一般要满足下列特性：

- 唯一性
- 高可用
- 高性能
- 递增性
- 安全性

为了增加ID的安全性，我们可以不直接使用Redis自增的数值，而是拼接一些其他信息。

ID的组成部分：

- 符号位：1bit，永远为0（正数）
- 时间戳：31bit，以秒为单位，可以使用69年
- 序列号：32bit，Redis自增数值，秒内的计数器，支持每秒产生2^32个不同ID

```java
package com.hmdp.utils;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;

@Component
public class RedisIdWorker {
    // 开始时间戳
    private static final long BEGIN_TIMESTAMP = 1704067200L;
    // 序列号位数
    private static final int COUNT_BITS = 32;
    @Autowired
    private StringRedisTemplate stringRedisTemplate;

    public long nextId(String keyPrefix) {
        // 1. 生成时间戳
        LocalDateTime now = LocalDateTime.now();
        long nowSecond = now.toEpochSecond(ZoneOffset.UTC);
        long timestamp = nowSecond - BEGIN_TIMESTAMP;
        // 2. 生成序列号
        // 2.1 获取当前日期，精确到天
        String date = now.format(DateTimeFormatter.ofPattern("yyyy:MM:dd"));
        // 2.2 自增
        long count = stringRedisTemplate.opsForValue().increment("icr:" + keyPrefix + ":" + date);
        // 3. 拼接并返回

        return timestamp << COUNT_BITS | count;
    }

//    public static void main(String[] args) {
//        LocalDateTime time = LocalDateTime.of(2024, 1, 1, 0, 0, 0);
//        long second = time.toEpochSecond(ZoneOffset.UTC);
//        System.out.println(second);
//    }
}
```

# 二、实现优惠券秒杀下单

平价券可以任意购买，特价券需要秒杀购买。

# 三、超卖问题

超卖问题是典型的多线程安全问题，针对这一问题常见的解决方案是加锁。

悲观锁

- 认为线程安全问题一定会发生，因此在操作数据之前先获取锁，确保线程串行执行
- 例如Synchronized, Lock都属于悲观锁
- 优点：简单粗暴；缺点：性能一般

乐观锁

- 认为线程安全问题不一定会发生，因此不加锁，只是在更新数据时去判断有没有其他线程对数据做了修改
- 如果没有修改则认为是安全的，自己才更新数据
- 如果已经被其他线程修改说明发生了安全问题，此时可以重试或异常
- 优点：性能好；缺点：存在成功率低的问题
- 乐观锁的关键是判断之前查询得到的数据是否被修改过，常见的方式有两种：
  - 版本号法
  - CAS法：数据本身有没有变化

```java
// 5. 扣减库存
boolean success = seckillVoucherService.update()
        .setSql("stock = stock - 1") // set stock = stock - 1
        .eq("voucher_id", voucherId) // where voucher_id = ?
        .gt("stock", 0) // where stock > 0
        .update();
```

# 四、一人一单

```java
Long userId = UserHolder.getUser().getId();
    synchronized (userId.toString().intern()) {
        // 获取代理对象 事务
        IVoucherOrderService proxy = (IVoucherOrderService)AopContext.currentProxy();
        return proxy.createVoucherOrder(voucherId);
    }
}
@Transactional
public Result createVoucherOrder(Long voucherId){
    // 5. 一人一单
    Long userId = UserHolder.getUser().getId();

    // 5.1 查询订单
    int count = query()
            .eq("user_id", userId)
            .eq("voucher_id", voucherId)
            .count();
    // 5.2 判断是否存在
    if (count > 0){
        return Result.fail("该用户已经购买过一次");
    }
    // 6. 扣减库存
    boolean success = seckillVoucherService.update()
            .setSql("stock = stock - 1") // set stock = stock - 1
            .eq("voucher_id", voucherId) // where voucher_id = ?
            .gt("stock", 0) // where stock > 0
            .update();
    if (!success){
        return Result.fail("库存不足");
    }
    // 7. 创建订单
    VoucherOrder voucherOrder = new VoucherOrder();
    // 订单ID
    long orderId = redisIdWorker.nextId("order");
    voucherOrder.setId(orderId);
    // 优惠券ID
    voucherOrder.setVoucherId(voucherId);
    // 用户ID
    voucherOrder.setUserId(userId);
    save(voucherOrder);
    return Result.ok(orderId);

}
```

# 五、分布式锁

分布式锁：满足分布式系统或集群模式下多进程可见并且互斥的锁。

## 实现分布式锁

实现分布式锁时需要实现的两个基本方法：

- 获取锁：
  - 互斥：确保只能有一个线程获取锁 setnx lock thread1
- 释放锁：
  - 手动释放 del lock
  - 超时释放：获取锁时添加一个超时时间

```java
package com.hmdp.utils;
import org.springframework.data.redis.core.StringRedisTemplate;
import java.util.concurrent.TimeUnit;

public class SimpleRedisLock implements ILock{
    private String name; // 锁的名字,业务名称
    private StringRedisTemplate stringRedisTemplate;

    private static final String KEY_PREFIX = "lock:";

    public SimpleRedisLock(String name, StringRedisTemplate stringRedisTemplate) {
        this.name = name;
        this.stringRedisTemplate = stringRedisTemplate;
    }

    @Override
    public boolean tryLock(long timeoutSec) {
        String key = KEY_PREFIX + name;
        String value = Thread.currentThread().getId() + "";
        // 获取锁
        Boolean success = stringRedisTemplate.opsForValue().setIfAbsent(key, value, timeoutSec, TimeUnit.SECONDS);
        return Boolean.TRUE.equals(success);
    }

    @Override
    public void unlock() {
        // 释放锁
        stringRedisTemplate.delete(KEY_PREFIX + name);
    }
}
```

## 分布式锁误删

逻辑说明：持有锁的线程在锁的内部出现了阻塞，导致他的锁自动释放，这时其他线程，线程2来尝试获得锁，就拿到了这把锁，然后线程2在持有锁执行过程中，线程1反应过来，继续执行，而线程1执行过程中，走到了删除锁逻辑，此时就会把本应该属于线程2的锁进行删除，这就是误删别人锁的情况说明。

解决方案：解决方案就是在每个线程释放锁的时候，去判断一下当前这把锁是否属于自己，如果属于自己，则不进行锁的删除，假设还是上边的情况，线程1卡顿，锁自动释放，线程2进入到锁的内部执行逻辑，此时线程1反应过来，然后删除锁，但是线程1，一看当前这把锁不是属于自己，于是不进行删除锁逻辑，当线程2走到删除锁逻辑时，如果没有卡过自动释放锁的时间点，则判断当前这把锁是属于自己的，于是删除这把锁。

需求：修改之前的分布式锁实现，满足：在获取锁时存入线程标示（可以用UUID表示）
在释放锁时先获取锁中的线程标示，判断是否与当前线程标示一致

* 如果一致则释放锁
* 如果不一致则不释放锁

核心逻辑：在存入锁时，放入自己线程的标识，在删除锁时，判断当前这把锁的标识是不是自己存入的，如果是，则进行删除，如果不是，则不进行删除。

加锁

```java
private static final String ID_PREFIX = UUID.randomUUID().toString(true) + "-";
@Override
public boolean tryLock(long timeoutSec) {
   // 获取线程标示
   String threadId = ID_PREFIX + Thread.currentThread().getId();
   // 获取锁
   Boolean success = stringRedisTemplate.opsForValue()
                .setIfAbsent(KEY_PREFIX + name, threadId, timeoutSec, TimeUnit.SECONDS);
   return Boolean.TRUE.equals(success);
}
```

释放锁

```java
public void unlock() {
    // 获取线程标示
    String threadId = ID_PREFIX + Thread.currentThread().getId();
    // 获取锁中的标示
    String id = stringRedisTemplate.opsForValue().get(KEY_PREFIX + name);
    // 判断标示是否一致
    if(threadId.equals(id)) {
        // 释放锁
        stringRedisTemplate.delete(KEY_PREFIX + name);
    }
}
```

**有关代码实操说明：**

在我们修改完此处代码后，我们重启工程，然后启动两个线程，第一个线程持有锁后，手动释放锁，第二个线程 此时进入到锁内部，再放行第一个线程，此时第一个线程由于锁的value值并非是自己，所以不能释放锁，也就无法删除别人的锁，此时第二个线程能够正确释放锁，通过这个案例初步说明我们解决了锁误删的问题。

## 分布式锁的原子性问题

Redis提供了Lua脚本功能，在一个脚本中编写多条Redis命令，确保多条命令执行时的原子性。
