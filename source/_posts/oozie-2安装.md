---
title: oozie_2
date: 2017-05-01 23:22:56
tags:
---

# Oozie-2_安装

[TOC]

# 1. 设置环境变量

解压 `oozie-4.1.0-cdh5.7.0.tar.gz`

```
# 目录自定义
export OOZIE_HOME="/Users/icemimosa/mimosa/oozie-4.1.0"
export PATH="$PATH:$OOZIE_HOME/bin:..."
```

# 2. 生成 war 包

1、在 Oozie Home 目录下新建文件夹：`libext`，然后将 **mysql驱动** 和 **extJs2.2** 放入libext文件夹下。

- [ext-2.2.zip 下载, 密码49da](https://yunpan.cn/cBjxLdLSWeSvv)

> 备注：
>
> 1. 由于Oozie需要保存**任务调度**的元数据，默认使用的Derby数据库，这里修改为Mysql。
> 2. extJs的zip包名字必须是 `ext-2.2.zip` , 这里可以看bin/oozie-setup.sh脚本。

2、然后在加入hadoop相关的jar包（除去yarn相关的，位于 $OOZIE_HOME/libtools, 以及一些其他jar

总体如下（截图）：

![libext截图](http://7xsz2j.com1.z0.glb.clouddn.com/Oozie_libext.png?imageMogr2/thumbnail/!50p)

- 执行脚本，生成 war 包

```
bin/oozie-setup.sh prepare-war

# 然后在 $OOZIE_HOME/oozie-server/webapps下生成 oozie.war
```

# 3. 修改数据源配置

Oozie 的默认配置是 **$OOZIE_HOME/conf** 下的 `oozie-default.xml` 文件, 然后可以在 `oozie-site.xml` 实现**配置的覆盖**

```
# 增加如下
<!-- DataBase configuration -->
<property>
   <name>oozie.service.JPAService.jdbc.driver</name>
   <value>com.mysql.jdbc.Driver</value>
   <description>
       JDBC driver class.
   </description>
</property>

<property>
   <name>oozie.service.JPAService.jdbc.url</name>
   <value>jdbc:mysql://127.0.0.1:3306/oozie</value>
   <description>
       JDBC URL.
   </description>
</property>

<property>
   <name>oozie.service.JPAService.jdbc.username</name>
   <value>root</value>
   <description>
       DB user name.
   </description>
</property>

<property>
   <name>oozie.service.JPAService.jdbc.password</name>
   <value>anywhere</value>
   <description>
       DB user password.

       IMPORTANT: if password is emtpy leave a 1 space string, the service trims the value,
                  if empty Configuration assumes it is NULL.

       IMPORTANT: if the StoreServicePasswordService is active, it will reset this value with the value given in
                  the console.
   </description>
</property>
```

# 4. 生成数据库schema脚本

- 创建数据库 `oozie`
- 执行命令: `bin/ooziedb.sh create -run -sqlfile oozie.sql`

随后在 $OOZIE_HOME 下生成 oozie.sql并执行。

# 5. 启动 Oozie 服务端

执行命令: `bin/oozied.sh start` 这个是 **后台启动**
剩下的还有 `run` 和 `stop`
如果启动报错，可以查看logs下的日志或者用 `run` 启动查询

> 然后打开网址：`http://localhost:11000/oozie/` 看看是否可以访问

# 6. 启动 Oozie Client 测试

## 6.1 修改配置

- 修改 $HADOOP_HOME/etc/hadoop/core-site.xml

```
# 增加, 将[USER]替换成机器的User
<property>
	<name>hadoop.proxyuser.[USER].hosts</name>
	<value>*</value>
</property>
<property>
	<name>hadoop.proxyuser.[USER].groups</name>
	<value>*</value>
</property>
```

- 修改 $HADOOP_HOME/etc/hadoop/mapred-site.xml

```
# 增加jobhistory, [HOST_NAME]为主机名
<property>
	<name>mapreduce.jobhistory.address</name>
	<value>[HOST_NAME]:10020</value>
</property>

# 设置mapreduce.map.memory.mb和mapreduce.reduce.memory.mb配置
# 否则Oozie读取的默认配置 -1, 提交给yarn的时候会抛异常Invalid resource request, requested memory < 0, or requested memory > max configured, requestedMemory=-1, maxMemory=8192

<property>
	<name>mapreduce.map.memory.mb</name>
	<value>1024</value>
	<description>The amount of memory to request from the scheduler for each
	 map task. If this is not specified or is non-positive, it is inferred from
	 mapreduce.map.java.opts and mapreduce.job.heap.memory-mb.ratio.
	 If java-opts are also not specified, we set it to 1024.
	</description>
</property>
<property>
	<name>mapreduce.reduce.memory.mb</name>
	<value>1024</value>
	<description>The amount of memory to request from the scheduler for each
	 reduce task. If this is not specified or is non-positive, it is inferred
	 from mapreduce.reduce.java.opts and mapreduce.job.heap.memory-mb.ratio.
	 If java-opts are also not specified, we set it to 1024.
	</description>
</property>
```

- 修改 **$OOZIE_HOME/conf** 下的 `oozie-site.xml`

```
# 增加Hadoop的conf配置
<property>
   <name>oozie.service.HadoopAccessorService.hadoop.configurations</name>
   <value>*=/Users/icemimosa/mimosa/hadoop-2.7.1/etc/hadoop</value>
   <description>
       Comma separated AUTHORITY=HADOOP_CONF_DIR, where AUTHORITY is the HOST:PORT of
       the Hadoop service (JobTracker, YARN, HDFS). The wildcard '*' configuration is
       used when there is no exact match for an authority. The HADOOP_CONF_DIR contains
       the relevant Hadoop *-site.xml files. If the path is relative is looked within
       the Oozie configuration directory; though the path can be absolute (i.e. to point
       to Hadoop client conf/ directories in the local filesystem.
   </description>
</property>

# 增加Spark的conf配置
<property>
   <name>oozie.service.SparkConfigurationService.spark.configurations</name>
   <value>*=/Users/icemimosa/mimosa/spark-1.6.2/conf</value>
   <description>
       Comma separated AUTHORITY=SPARK_CONF_DIR, where AUTHORITY is the HOST:PORT of
       the ResourceManager of a YARN cluster. The wildcard '*' configuration is
       used when there is no exact match for an authority. The SPARK_CONF_DIR contains
       the relevant spark-defaults.conf properties file. If the path is relative is looked within
       the Oozie configuration directory; though the path can be absolute.  This is only used
       when the Spark master is set to either "yarn-client" or "yarn-cluster".
   </description>
</property>
```

> tips：每次修改完配置记得重新启动Oozie服务

## 6.2 上传文件

- 上传 share lib

```
# 执行命令：
bin/oozie-setup.sh sharelib create -fs hdfs://127.0.0.1:9000 -locallib oozie-
sharelib-4.1.0-cdh5.7.0-yarn.tar.gz

# 或者(解压oozie-sharelib-4.1.0-cdh5.7.0-yarn.tar.gz)：
hadoop dfs -put share /user/[USER]/share

# 此时HDFS上就会生成目录 /user/[USER]/share/...
```

- 上传 examples

```
# 解压 oozie-examples.tar.gz
# 执行命令：
hadoop dfs -put examples /user/[USER]/examples
```

## 6.3 测试 map-reduce example

- 出了启动hadoop，别忘了启动 `jobhistory`

```
# 执行命令
mr-jobhistory-daemon.sh start historyserver
```

- 修改 **examples/apps/map-reduce** 下的 `job.properties` 文件, 指定 `hdfs地址` 和`resourceManager的地址`

```
nameNode=hdfs://localhost:9000
jobTracker=localhost:8032
queueName=default
examplesRoot=examples

oozie.wf.application.path=${nameNode}/user/${user.name}/${examplesRoot}/apps/map-reduce/workflow.xml
outputDir=map-reduce
```

- 提交作业

```
# 执行命令, $OOZIE_HOME为Oozie的home
oozie job -oozie http://localhost:11000/oozie -config $OOZIE_HOME/examples/apps/map-reduce/job.properties -run

# 显示（例子）:
# job: 0000000-160704142405284-oozie-icem-W
```

- 查看作业

```
# 执行命令（job id 为提交作业生成的id）：
bin/oozie job -oozie http://localhost:11000/oozie -info 0000000-160704140949971-oozie-icem-W

# 显示：
------------------------------------------------------------------------------------------------------------------------------------
Workflow Name : map-reduce-wf
App Path      : hdfs://localhost:9000/user/icemimosa/examples/apps/map-reduce/workflow.xml
Status        : KILLED
Run           : 0
User          : icemimosa
Group         : -
Created       : 2016-07-04 06:10 GMT
Started       : 2016-07-04 06:10 GMT
Last Modified : 2016-07-04 06:12 GMT
Ended         : 2016-07-04 06:12 GMT
CoordAction ID: -

Actions
----------------------------------------------------------------------------------
ID                         	               Status   Ext ID   Ext  Status Err Code
----------------------------------------------------------------------------------
0000000-160704140949971-oozie-icem-W@:start:  OK     -        OK         -
----------------------------------------------------------------------------------
0000000-160704140949971-oozie-icem-W@mr-node KILLED  job_1467612585401_0001 KILLED     -
----------------------------------------------------------------------------------
```

- 也可以通过 Oozie 控制台查看（要是一直处于RUNNING状态，也可以通过Hadoop job manager端查看日志等。默认：[http://localhost:8088/cluster](http://localhost:8088/cluster) ）
- 查看结果输出：

```
# hdfs路径：
hadoop dfs -cat /user/[USER]/examples/output-data/map-reduce/part-00000
```