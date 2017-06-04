---
title: oozie_1
date: 2017-04-28 23:22:34
tags:
---

# Oozie-1_编译

# 1. 官网(4.1.0)

下载：[http://archive.apache.org/dist/oozie/4.1.0/](http://archive.apache.org/dist/oozie/4.1.0/)

docs：[http://oozie.apache.org/docs/4.1.0/index.html](http://oozie.apache.org/docs/4.1.0/index.html)

书籍：

[Apache Oozie_ The Workflow Scheduler for Hadoop.pdf](http://7xsz2j.com1.z0.glb.clouddn.com/Apache%20Oozie_%20The%20Workflow%20Scheduler%20for%20Hadoop.pdf)
[Apache Oozie Essentials](http://7xsz2j.com1.z0.glb.clouddn.com/Apache.Oozie.Essentials.pdf)

# 2. 编译

- 使用jdk7

> 修改 `Oozie` 根目录下的 `pom.xml`, 将和 `JavaVersion` 相关的修改为 **1.7**

- 修改hadoop的版本(可选)

> 修改 `Oozie` 根目录下的 `pom.xml`

```
<profile>
  <id>hadoop-2</id>
  <activation>
     <activeByDefault>false</activeByDefault>
  </activation>
  <properties>
    <hadoop.version>2.6.0</hadoop.version>
    <hadoop.auth.version>2.6.0</hadoop.auth.version>
    <pig.classifier>h2</pig.classifier>
    <sqoop.classifier>hadoop200</sqoop.classifier>
  </properties>
</profile>

<dependency>
	<groupId>org.apache.hadoop</groupId>
	<artifactId>hadoop-minikdc</artifactId>
	<version>2.6.0</version>
</dependency>
```

- 使用tomcat7 (可选)

> 修改 `Oozie/distro` 目录下的 `pom.xml`, 将 `tomcat-6` 相关的修改为 **tomcat-7**

- 执行命令 (使用hadoop2.x)

> `bin/mkdistro.sh -DskipTests -P hadoop-2 -Dhadoop.version=2.6.0`
> 如果使用tomcat7，加上参数 `-Dtomcat.version=7.0.52`

编译完成的文件：[Oozie-4.1.0.zip 访问密码 c45f](https://yunpan.cn/cBjuFHkLsifj9)
然后取出 `Oozie/distro/target/oozie-4.1.0-distro.tar.gz` 解压，即为编译后的发行版本。

手动编译好的文件缺少很多hadoop，hive等等相关的jar，需要将目录下的hadooplibs等等手动引入，还要去重，比较麻烦。
这里采用cdh编译好的Oozie: [http://archive.cloudera.com/cdh5/cdh/5/](http://archive.cloudera.com/cdh5/cdh/5/)
下载 `oozie-4.1.0-cdh5.7.0.tar.gz`, 目录文件基本和上述的发行版本一致，不过已经将相关的jar集成了进去。

- 至此：编译完成！！