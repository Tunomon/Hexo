---
title: Redis备份方案学习
date: 2018-07-09 11:18:44
tags: Redis
---

redis有两种备份持久化方案：

1. RDB方式；
   1. 简介：在指定的时间间隔内生成数据集的时间点快照;
   2. 优点：
      1. rdb类型文件紧凑较小，保存Redis 在某个时间点上的数据集;
      2. RDB 在恢复大数据集时的速度比 AOF 的恢复速度要快;
      3. RDB 可以最大化 Redis 的性能：父进程在保存 RDB 文件时唯一要做的就是 `fork` 出一个子进程，然后这个子进程就会处理接下来的所有保存工作，父进程无须执行任何磁盘 I/O 操作。
   3. 缺点：
      1. RDB文件不适合服务器故障时丢失数据。因为RDB 文件需要保存整个数据集的状态，若在两次保存间隔中服务器故障，则这段时间内所有数据会丢失；
      2. 每次保存 RDB 的时候，Redis 都要 `fork()` 出一个子进程，并由子进程来进行实际的持久化工作。 在数据集比较庞大时， `fork()`可能会非常耗时，造成服务器在某某毫秒内停止处理客户端； 如果数据集非常巨大，并且 CPU 时间非常紧张的话，那么这种停止时间甚至可能会长达整整一秒。 
2. AOF方式(append only file)；
   1. 简介：记录服务器执行的所有写操作命令，并在服务器启动时，通过重新执行这些命令来还原数据集。 AOF 文件中的命令全部以 Redis 协议的格式来保存，新命令会被追加到文件的末尾。
   2. 优点：
      1. aof方式使数据耐久性很好，默认每秒钟 `fsync` 一次,或可以设置为每次执行写入命令时 `fsync`.
      2. Redis 可以在 AOF 文件体积变得过大时，自动地在后台对 AOF 进行重写。
   3. 缺点：
      1. 对于相同的数据集来说，AOF 文件的体积通常要大于 RDB 文件的体积；
      2. 根据使用的策略不同，AOF 的速度可能会慢于 RDB 。



2. 具体开启方式：

   1. RDB方式；

      1. 自动触发：

         在redis.conf中进行配置；

         ```Json
         save 900 1 // 在满足“ 60 秒内有至少有 1 个键被改动”这一条件时， 自动保存一次数据集
         save 300 10 // 300秒内至少有 10 个键被改动
         save 60 10000 // 60秒内至少有 10000 个键被改动
         ```

      2. 手动触发：

         1. SAVE命令：阻塞当前Redis服务器，直到RDB过程完成为止，对于内存比较大的实例会造成长时间阻塞。
         2. BGSAVE命令：Redis进程执行fork操作创建子进程，RDB持久化过程由子进程负责，完成后自动结束。阻塞只发生在fork阶段，一段时间很短。

      3. 触发完成后，会在对应的文件夹中产生dump.rdb文件，文件夹可以在redis中利用命令`CONFIG GET dir`查看；

      4. 将dump.rdb文件放在这个文件夹中，重启redis时候会自动读取其中数据恢复redis。

   2. AOF方式

      1. 开启方式：

         1. 配置方式（需要重启，**不建议**）

            1. 在配置中设置appendonly为yes，默认为no；
            2. appendfilename为文件名，默认为appendonly.aof；
            3. appendfsync为同步的方式，有三个方式：
               1. no => redis不主动调用fsync，何时刷盘由OS来调度；     
               2. always => redis针对每个写入命令均会主动调用fsync刷磁盘；
               3. everysec => 每秒调一次fsync刷盘。（推荐，兼顾性能和效率）
            4. 保存路径同RDB持久化方式一致。

         2. redis 2.2以后版本支持不重启将rdb方案转换成aof方案（我们服务器版本大于2.2）；

            ![](https://ws4.sinaimg.cn/large/006tNc79ly1frlai3q1qrj30uc0j343l.jpg)

      2. AOF文件重写：

         1. 手动触发：执行 [BGREWRITEAOF](http://redisdoc.com/server/bgrewriteaof.html#bgrewriteaof) 命令， Redis 将生成一个新的 AOF 文件， 这个文件包含重建当前数据集所需的最少命令。

         2. 自动触发：

            1. 配置文件中：

               1. auto-aof-rewrite-percentage 

                  指定Redis重写aof文件的条件，默认为100，表示与上次rewrite的aof文件大小相比，当前aof文件增长量超过上次afo文件大小的100%时，就会触发background rewrite。若配置为0，则会禁用自动rewrite。

               2. auto-aof-rewrite-min-size

                  指定触发rewrite的aof文件大小。若aof文件小于该值，即使当前文件的增量比例达到auto-aof-rewrite-percentage的配置值，也不会触发自动rewrite。即这两个配置项同时满足时，才会触发rewrite。

               3. no-appendfsync-on-rewrite

                   指定是否在后台aof文件rewrite期间调用fsync，默认为no，在日志重写时，不进行命令追加操作，而只是将其放在缓冲区里，避免与命令的追加造成DISK IO上的冲突。  







>  [redis持久化(中文)](http://redisdoc.com/topic/persistence.html)
>
> [redis持久化(英文)](https://redis.io/topics/persistence)

 

 

 