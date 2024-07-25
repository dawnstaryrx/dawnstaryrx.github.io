+++
title = "【Java NIO2】ByteBuffer"
date = "2024-07-12T09:52:00+08:00"

tags = ["Java","Netty"]
+++

## 2. ByteBuffer

### 2.1 ByteBuffer的基本使用

1. 向buffer写入数据，例如调用channel.read(buffer)
2. 调用flip()切换至**读模式**
3. 从buffer读取数据，例如调用buffer.get()
4. 调用clear()或compact()切换至**写模式**
5. 重复1~4步骤

```java
// FileChannel 数据的读写通道
// 1. 输入输出流 2. RandomAccessFile .twr
try (FileChannel channel = new FileInputStream("./data.txt").getChannel()) {
    // 准备缓冲区
    ByteBuffer buffer = ByteBuffer.allocate(10);
    // 从 channel 读取数据，向 buffer 写入。 alt+enter
    while (true){
        int len = channel.read(buffer);
        log.debug("读取到的字节数 {}", len);
        if (len == -1){  // 没有内容可读
            break;
        }
        // 打印 buffer 的内容
        buffer.flip(); // 切换到读模式
        while (buffer.hasRemaining()){ // 是否还有剩余未读数据
            byte b = buffer.get();
            log.debug("实际字节 {}", (char)b);
        }
        // buffer切换为写模式
        buffer.clear();
    }
} catch (IOException e) {
    e.printStackTrace();
}
```

输出

```text
09:35:14 [DEBUG] [main] d.c.ByteBufferTest - 读取到的字节数 10
09:35:14 [DEBUG] [main] d.c.ByteBufferTest - 实际字节 1
09:35:14 [DEBUG] [main] d.c.ByteBufferTest - 实际字节 2
09:35:14 [DEBUG] [main] d.c.ByteBufferTest - 实际字节 3
09:35:14 [DEBUG] [main] d.c.ByteBufferTest - 实际字节 4
09:35:14 [DEBUG] [main] d.c.ByteBufferTest - 实际字节 5
09:35:14 [DEBUG] [main] d.c.ByteBufferTest - 实际字节 6
09:35:14 [DEBUG] [main] d.c.ByteBufferTest - 实际字节 7
09:35:14 [DEBUG] [main] d.c.ByteBufferTest - 实际字节 8
09:35:14 [DEBUG] [main] d.c.ByteBufferTest - 实际字节 9
09:35:14 [DEBUG] [main] d.c.ByteBufferTest - 实际字节 0
09:35:14 [DEBUG] [main] d.c.ByteBufferTest - 读取到的字节数 3
09:35:14 [DEBUG] [main] d.c.ByteBufferTest - 实际字节 a
09:35:14 [DEBUG] [main] d.c.ByteBufferTest - 实际字节 b
09:35:14 [DEBUG] [main] d.c.ByteBufferTest - 实际字节 c
09:35:14 [DEBUG] [main] d.c.ByteBufferTest - 读取到的字节数 -1
```

### 2.2 ByteBuffer 的结构

ByteBuffer 有以下重要属性

* capacity：容量
* position：读写指针
* limit：读写限制

一开始

![](https://dawnstar-blog-1309734834.cos.ap-nanjing.myqcloud.com/img/2024%2F07%2F11%2Fc8a78053293105a1ce22334ebe26853f-0021-8cf685.png)

写模式下，position 是写入位置，limit 等于容量，下图表示写入了 4 个字节后的状态

![](https://dawnstar-blog-1309734834.cos.ap-nanjing.myqcloud.com/img/2024%2F07%2F11%2F86a06b91acb74a9c2ff00a10004bdc3d-0018-f6dce3.png)

flip 动作发生后，position 切换为读取位置，limit 切换为读取限制

![](https://dawnstar-blog-1309734834.cos.ap-nanjing.myqcloud.com/img/2024%2F07%2F11%2Fc3197ff6217affbbcc20ab865ae58ee1-0019-9fd105.png)

读取 4 个字节后，状态

![](https://dawnstar-blog-1309734834.cos.ap-nanjing.myqcloud.com/img/2024%2F07%2F11%2F8202e9da57d2a913d86d057dc5140226-0020-57d9ba.png)

clear 动作发生后，状态

![](https://dawnstar-blog-1309734834.cos.ap-nanjing.myqcloud.com/img/2024%2F07%2F11%2Fc8a78053293105a1ce22334ebe26853f-0021-8cf685.png)

compact 方法，是把未读完的部分向前压缩，然后切换至写模式

![0022](https://dawnstar-blog-1309734834.cos.ap-nanjing.myqcloud.com/img/2024%2F07%2F11%2Fa46df9c4e66a8e545792dbedfc4650fd-0022-2366b4.png)

#### 💡 调试工具类

```java
public class ByteBufferUtil {
    private static final char[] BYTE2CHAR = new char[256];
    private static final char[] HEXDUMP_TABLE = new char[256 * 4];
    private static final String[] HEXPADDING = new String[16];
    private static final String[] HEXDUMP_ROWPREFIXES = new String[65536 >>> 4];
    private static final String[] BYTE2HEX = new String[256];
    private static final String[] BYTEPADDING = new String[16];

    static {
        final char[] DIGITS = "0123456789abcdef".toCharArray();
        for (int i = 0; i < 256; i++) {
            HEXDUMP_TABLE[i << 1] = DIGITS[i >>> 4 & 0x0F];
            HEXDUMP_TABLE[(i << 1) + 1] = DIGITS[i & 0x0F];
        }

        int i;

        // Generate the lookup table for hex dump paddings
        for (i = 0; i < HEXPADDING.length; i++) {
            int padding = HEXPADDING.length - i;
            StringBuilder buf = new StringBuilder(padding * 3);
            for (int j = 0; j < padding; j++) {
                buf.append("   ");
            }
            HEXPADDING[i] = buf.toString();
        }

        // Generate the lookup table for the start-offset header in each row (up to 64KiB).
        for (i = 0; i < HEXDUMP_ROWPREFIXES.length; i++) {
            StringBuilder buf = new StringBuilder(12);
            buf.append(NEWLINE);
            buf.append(Long.toHexString(i << 4 & 0xFFFFFFFFL | 0x100000000L));
            buf.setCharAt(buf.length() - 9, '|');
            buf.append('|');
            HEXDUMP_ROWPREFIXES[i] = buf.toString();
        }

        // Generate the lookup table for byte-to-hex-dump conversion
        for (i = 0; i < BYTE2HEX.length; i++) {
            BYTE2HEX[i] = ' ' + StringUtil.byteToHexStringPadded(i);
        }

        // Generate the lookup table for byte dump paddings
        for (i = 0; i < BYTEPADDING.length; i++) {
            int padding = BYTEPADDING.length - i;
            StringBuilder buf = new StringBuilder(padding);
            for (int j = 0; j < padding; j++) {
                buf.append(' ');
            }
            BYTEPADDING[i] = buf.toString();
        }

        // Generate the lookup table for byte-to-char conversion
        for (i = 0; i < BYTE2CHAR.length; i++) {
            if (i <= 0x1f || i >= 0x7f) {
                BYTE2CHAR[i] = '.';
            } else {
                BYTE2CHAR[i] = (char) i;
            }
        }
    }

    /**
     * 打印所有内容
     * @param buffer
     */
    public static void debugAll(ByteBuffer buffer) {
        int oldlimit = buffer.limit();
        buffer.limit(buffer.capacity());
        StringBuilder origin = new StringBuilder(256);
        appendPrettyHexDump(origin, buffer, 0, buffer.capacity());
        System.out.println("+--------+-------------------- all ------------------------+----------------+");
        System.out.printf("position: [%d], limit: [%d]\n", buffer.position(), oldlimit);
        System.out.println(origin);
        buffer.limit(oldlimit);
    }

    /**
     * 打印可读取内容
     * @param buffer
     */
    public static void debugRead(ByteBuffer buffer) {
        StringBuilder builder = new StringBuilder(256);
        appendPrettyHexDump(builder, buffer, buffer.position(), buffer.limit() - buffer.position());
        System.out.println("+--------+-------------------- read -----------------------+----------------+");
        System.out.printf("position: [%d], limit: [%d]\n", buffer.position(), buffer.limit());
        System.out.println(builder);
    }

    private static void appendPrettyHexDump(StringBuilder dump, ByteBuffer buf, int offset, int length) {
        if (isOutOfBounds(offset, length, buf.capacity())) {
            throw new IndexOutOfBoundsException(
                    "expected: " + "0 <= offset(" + offset + ") <= offset + length(" + length
                            + ") <= " + "buf.capacity(" + buf.capacity() + ')');
        }
        if (length == 0) {
            return;
        }
        dump.append(
                "         +-------------------------------------------------+" +
                        NEWLINE + "         |  0  1  2  3  4  5  6  7  8  9  a  b  c  d  e  f |" +
                        NEWLINE + "+--------+-------------------------------------------------+----------------+");

        final int startIndex = offset;
        final int fullRows = length >>> 4;
        final int remainder = length & 0xF;

        // Dump the rows which have 16 bytes.
        for (int row = 0; row < fullRows; row++) {
            int rowStartIndex = (row << 4) + startIndex;

            // Per-row prefix.
            appendHexDumpRowPrefix(dump, row, rowStartIndex);

            // Hex dump
            int rowEndIndex = rowStartIndex + 16;
            for (int j = rowStartIndex; j < rowEndIndex; j++) {
                dump.append(BYTE2HEX[getUnsignedByte(buf, j)]);
            }
            dump.append(" |");

            // ASCII dump
            for (int j = rowStartIndex; j < rowEndIndex; j++) {
                dump.append(BYTE2CHAR[getUnsignedByte(buf, j)]);
            }
            dump.append('|');
        }

        // Dump the last row which has less than 16 bytes.
        if (remainder != 0) {
            int rowStartIndex = (fullRows << 4) + startIndex;
            appendHexDumpRowPrefix(dump, fullRows, rowStartIndex);

            // Hex dump
            int rowEndIndex = rowStartIndex + remainder;
            for (int j = rowStartIndex; j < rowEndIndex; j++) {
                dump.append(BYTE2HEX[getUnsignedByte(buf, j)]);
            }
            dump.append(HEXPADDING[remainder]);
            dump.append(" |");

            // Ascii dump
            for (int j = rowStartIndex; j < rowEndIndex; j++) {
                dump.append(BYTE2CHAR[getUnsignedByte(buf, j)]);
            }
            dump.append(BYTEPADDING[remainder]);
            dump.append('|');
        }

        dump.append(NEWLINE +
                "+--------+-------------------------------------------------+----------------+");
    }

    private static void appendHexDumpRowPrefix(StringBuilder dump, int row, int rowStartIndex) {
        if (row < HEXDUMP_ROWPREFIXES.length) {
            dump.append(HEXDUMP_ROWPREFIXES[row]);
        } else {
            dump.append(NEWLINE);
            dump.append(Long.toHexString(rowStartIndex & 0xFFFFFFFFL | 0x100000000L));
            dump.setCharAt(dump.length() - 9, '|');
            dump.append('|');
        }
    }

    public static short getUnsignedByte(ByteBuffer buffer, int index) {
        return (short) (buffer.get(index) & 0xFF);
    }
}
```

### 2.3 ByteBuffer的常见方法

#### 分配空间

可以使用 allocate 方法为 ByteBuffer 分配空间，其它 buffer 类也有该方法，分配的容量不能动态调整。 

```java
System.out.println(ByteBuffer.allocate(10).getClass());
System.out.println(ByteBuffer.allocateDirect(10).getClass());
/*
class java.nio.HeapByteBuffer
- Java 堆内存：读写效率较低；受到垃圾回收的影响
class java.nio.DirectByteBuffer
- 直接内存： 读写效率高（少一次拷贝）；不会受GC的影响；分配内存的效率低，使用不当会造成内存泄露
 */
```



#### 向 buffer 写入数据

有两种办法

* 调用 channel 的 read 方法
* 调用 buffer 自己的 put 方法

```java
int readBytes = channel.read(buf);
```

和

```java
buf.put((byte)127);
```



#### 从 buffer 读取数据

同样有两种办法

* 调用 channel 的 write 方法
* 调用 buffer 自己的 get 方法

```java
int writeBytes = channel.write(buf);
```

和

```java
byte b = buf.get();
```

get 方法会让 position 读指针向后走，如果想重复读取数据

* 可以调用 rewind 方法将 position 重新置为 0
* 或者调用 get(int i) 方法获取索引 i 的内容，它不会移动读指针



#### mark 和 reset

mark 是在读取时，做一个标记，即使 position 改变，只要调用 reset 就能回到 mark 的位置

> **注意**
>
> rewind 和 flip 都会清除 mark 位置

```java
ByteBuffer buffer = ByteBuffer.allocate(10);
buffer.put(new byte[]{'a', 'b', 'c', 'd'});
buffer.flip();

// rewind 从头开始读
buffer.get(new byte[4]);
debugAll(buffer);
buffer.rewind();
debugAll(buffer);

// mark & reset
// mark 做一个标记，记录 position 的位置
// reset 将 position 重置到 mark 的位置
System.out.println((char)buffer.get());
System.out.println((char)buffer.get());
buffer.mark(); // mark 2
System.out.println((char)buffer.get());
System.out.println((char)buffer.get());
buffer.reset(); // reset 2
System.out.println((char)buffer.get());
System.out.println((char)buffer.get());

// get(i) 不会改变读指针
System.out.println((char)buffer.get(2));
debugAll(buffer);
```



#### 字符串与 ByteBuffer 互转

```java
String str = "Hello";
// 1. 字符串 -> ByteBuffer
ByteBuffer buffer1 = ByteBuffer.allocate(16);
buffer1.put(str.getBytes());
debugAll(buffer1);

// 2. Charset 字符集类，自动切换到读模式
ByteBuffer buffer2 = StandardCharsets.UTF_8.encode(str);
debugAll(buffer2);

// 3. wrap
ByteBuffer buffer3 = ByteBuffer.wrap(str.getBytes());
debugAll(buffer3);

// 4. ByteBuffer -> 字符串
// 2，3直接还原 因为已经切换读模式
String str2 = StandardCharsets.UTF_8.decode(buffer2).toString();
System.out.println(str2);
// 1 需要切换读模式
buffer1.flip();
String str1 = StandardCharsets.UTF_8.decode(buffer1).toString();
System.out.println(str1);
```

#### ⚠️ Buffer 的线程安全

> Buffer 是**非线程安全的**



### 2.4 Scattering Reads

分散读取，有一个文本文件 3parts.txt

```
onetwothree
```

使用如下方式读取，可以将数据填充至多个 buffer

```java
try (RandomAccessFile file = new RandomAccessFile("3parts.txt", "rw")) {
    FileChannel channel = file.getChannel();
    ByteBuffer a = ByteBuffer.allocate(3);
    ByteBuffer b = ByteBuffer.allocate(3);
    ByteBuffer c = ByteBuffer.allocate(5);
    channel.read(new ByteBuffer[]{a, b, c});
    a.flip();
    b.flip();
    c.flip();
    debugAll(a);
    debugAll(b);
    debugAll(c);
} catch (IOException e) {
    e.printStackTrace();
}
```

### 2.5 Gathering Writes

使用如下方式写入，可以将多个 buffer 的数据填充至 channel

```java
ByteBuffer b1 = StandardCharsets.UTF_8.encode("Hello");
ByteBuffer b2 = StandardCharsets.UTF_8.encode("World");
ByteBuffer b3 = StandardCharsets.UTF_8.encode("你好");

try (FileChannel channel = new RandomAccessFile("words.txt", "rw").getChannel()){
    channel.write(new ByteBuffer[]{b1, b2, b3});
} catch (IOException e) {
}
```



### 2.6 练习

网络上有多条数据发送给服务端，数据之间使用 \n 进行分隔
但由于某种原因这些数据在接收时，被进行了重新组合，例如原始数据有3条为

* Hello,world\n
* I'm zhangsan\n
* How are you?\n

变成了下面的两个 byteBuffer (黏包，半包)

* Hello,world\nI'm zhangsan\nHo
* w are you?\n

现在要求你编写程序，将错乱的数据恢复成原始的按 \n 分隔的数据

```java
public static void main(String[] args) {
    ByteBuffer source = ByteBuffer.allocate(32);
    source.put("Hello,world\nI'm zhangsan\nHo".getBytes());
    splite(source);
    source.put("w are you?\n".getBytes());
    splite(source);
}

public static void splite(ByteBuffer source) {
    source.flip();
    for (int i = 0; i < source.limit(); i++) {
        // 找到一条完整消息
        if (source.get(i) == '\n') {
            int length = i + 1 - source.position();
            // 把这条完整消息存入新的ByteBuffer
            ByteBuffer target = ByteBuffer.allocate(length);
            // 从source读，向target写
            for (int j = 0; j < length; j++) {
                byte b = source.get();
                target.put(b);
            }
            debugAll(target);
        }
    }
    source.compact();
}
```
